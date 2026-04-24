// Paystack Transfer - Mobile Money (withdraw)
// NOTE: Requires KYC-verified Paystack account with Transfers enabled.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYSTACK_HOST = "https://api.paystack.co";

const PROVIDER_MAP: Record<string, string> = {
  mtn: "MTN",
  vodafone: "VOD",
  airteltigo: "ATL",
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
    const bankCode = PROVIDER_MAP[operator];

    if (!amount || amount <= 0 || !phoneRaw || !bankCode) {
      return new Response(JSON.stringify({ error: "amount, phone and supported operator are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let phone = phoneRaw;
    if (phone.startsWith("233")) phone = "0" + phone.slice(3);
    if (!phone.startsWith("0")) phone = "0" + phone;

    const admin = createClient(supabaseUrl, serviceKey);

    // Check wallet balance
    const { data: wallet } = await admin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!wallet || Number(wallet.balance) < amount) {
      return new Response(JSON.stringify({ error: "Insufficient wallet balance" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Create transfer recipient
    const recipientRes = await fetch(`${PAYSTACK_HOST}/transferrecipient`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "mobile_money",
        name: user.email ?? "SusuCircle user",
        account_number: phone,
        bank_code: bankCode,
        currency: "GHS",
      }),
    });
    const recipientData = await recipientRes.json();
    console.log("Paystack recipient:", JSON.stringify(recipientData));

    if (!recipientRes.ok || !recipientData.status) {
      return new Response(JSON.stringify({ error: "Could not create recipient", details: recipientData }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recipientCode = recipientData.data.recipient_code;
    const reference = `wd_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    // 2. Initiate transfer
    const transferRes = await fetch(`${PAYSTACK_HOST}/transfer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        reason: "SusuCircle withdrawal",
        amount: Math.round(amount * 100),
        recipient: recipientCode,
        currency: "GHS",
        reference,
      }),
    });
    const transferData = await transferRes.json();
    console.log("Paystack transfer:", JSON.stringify(transferData));

    if (!transferRes.ok || !transferData.status) {
      return new Response(JSON.stringify({ error: "Transfer failed", details: transferData }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const psStatus = transferData.data?.status as string | undefined;
    const initialStatus = psStatus === "success" ? "completed" : "pending";

    const { data: tx, error: txErr } = await admin
      .from("transactions")
      .insert({
        user_id: user.id,
        wallet_id: wallet.id,
        type: "withdrawal",
        status: initialStatus,
        amount,
        currency: "GHS",
        operator: operator as any,
        phone_number: phone,
        external_id: reference,
        description: `${operator.toUpperCase()} MoMo withdrawal (Paystack)`,
        metadata: {
          provider: "paystack",
          paystack_reference: transferData.data?.reference ?? reference,
          paystack_transfer_code: transferData.data?.transfer_code,
          paystack_status: psStatus,
          recipient_code: recipientCode,
        },
      })
      .select()
      .single();
    if (txErr) throw txErr;

    if (initialStatus === "completed") {
      await admin
        .from("wallets")
        .update({ balance: Number(wallet.balance) - amount })
        .eq("id", wallet.id);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        transaction_id: tx.id,
        reference,
        status: psStatus,
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
