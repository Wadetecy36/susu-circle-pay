// Paystack Charge - Mobile Money (deposit)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYSTACK_HOST = "https://api.paystack.co";

// Map our operator ids to Paystack provider codes (Ghana)
const PROVIDER_MAP: Record<string, string> = {
  mtn: "mtn",
  vodafone: "vod",
  airteltigo: "atl",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const secretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const body = await req.json();
    const amount = Number(body.amount);
    const phoneRaw = String(body.phone ?? "").replace(/\D/g, "");
    const operator = String(body.operator ?? "mtn").toLowerCase();
    const provider = PROVIDER_MAP[operator];

    if (!amount || amount <= 0 || !phoneRaw || !provider) {
      return new Response(JSON.stringify({ error: "amount, phone and supported operator are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize Ghanaian phone to local 0XXXXXXXXX (Paystack expects this format)
    let phone = phoneRaw;
    if (phone.startsWith("233")) phone = "0" + phone.slice(3);
    if (!phone.startsWith("0")) phone = "0" + phone;

    const admin = createClient(supabaseUrl, serviceKey);

    // Use user email or a fallback
    const email = user.email ?? `user_${user.id}@susucircle.app`;
    const reference = `dep_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    const chargePayload = {
      email,
      amount: Math.round(amount * 100), // Paystack uses kobo/pesewas
      currency: "GHS",
      reference,
      mobile_money: {
        phone,
        provider,
      },
    };

    const chargeRes = await fetch(`${PAYSTACK_HOST}/charge`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chargePayload),
    });

    const chargeData = await chargeRes.json();
    console.log("Paystack charge response:", JSON.stringify(chargeData));

    if (!chargeRes.ok || !chargeData.status) {
      return new Response(JSON.stringify({ error: "Paystack charge failed", details: chargeData }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get wallet
    const { data: wallet } = await admin
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    // Insert pending transaction
    const { data: tx, error: txErr } = await admin
      .from("transactions")
      .insert({
        user_id: user.id,
        wallet_id: wallet?.id ?? null,
        type: "deposit",
        status: "pending",
        amount,
        currency: "GHS",
        operator: operator as any,
        phone_number: phone,
        external_id: reference,
        description: `${operator.toUpperCase()} MoMo deposit (Paystack)`,
        metadata: {
          provider: "paystack",
          paystack_reference: chargeData.data?.reference ?? reference,
          paystack_status: chargeData.data?.status,
          display_text: chargeData.data?.display_text,
        },
      })
      .select()
      .single();
    if (txErr) throw txErr;

    return new Response(
      JSON.stringify({
        ok: true,
        transaction_id: tx.id,
        reference: chargeData.data?.reference ?? reference,
        status: chargeData.data?.status,
        display_text: chargeData.data?.display_text,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
