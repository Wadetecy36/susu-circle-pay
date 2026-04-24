// Paystack - Verify charge status & settle wallet on success
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAYSTACK_HOST = "https://api.paystack.co";

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
    const transactionId = String(body.transaction_id ?? "");
    if (!transactionId) {
      return new Response(JSON.stringify({ error: "transaction_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: tx, error: txErr } = await admin
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (txErr || !tx) {
      return new Response(JSON.stringify({ error: "Transaction not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If already settled, return current status
    if (tx.status === "completed" || tx.status === "failed") {
      return new Response(JSON.stringify({ status: tx.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reference = tx.external_id ?? (tx.metadata as any)?.paystack_reference;
    if (!reference) throw new Error("No paystack reference on transaction");

    const verifyRes = await fetch(`${PAYSTACK_HOST}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const verifyData = await verifyRes.json();
    console.log("Paystack verify:", JSON.stringify(verifyData));

    const psStatus = verifyData?.data?.status as string | undefined;
    let newStatus: "pending" | "processing" | "completed" | "failed" = "pending";
    if (psStatus === "success") newStatus = "completed";
    else if (psStatus === "failed" || psStatus === "abandoned" || psStatus === "reversed") newStatus = "failed";
    else if (psStatus === "ongoing" || psStatus === "pending" || psStatus === "send_otp" || psStatus === "pay_offline") newStatus = "processing";

    // Persist new status if changed
    if (newStatus !== tx.status) {
      await admin
        .from("transactions")
        .update({
          status: newStatus,
          metadata: { ...(tx.metadata as any), paystack_status: psStatus, gateway_response: verifyData?.data?.gateway_response },
        })
        .eq("id", tx.id);

      // On success, credit wallet for deposits / debit for withdrawals
      if (newStatus === "completed") {
        const { data: wallet } = await admin
          .from("wallets")
          .select("id, balance")
          .eq("user_id", user.id)
          .maybeSingle();
        if (wallet) {
          const delta = tx.type === "deposit" ? Number(tx.amount) : -Number(tx.amount);
          await admin
            .from("wallets")
            .update({ balance: Number(wallet.balance) + delta })
            .eq("id", wallet.id);
        }
      }
    }

    return new Response(JSON.stringify({ status: newStatus, paystack_status: psStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
