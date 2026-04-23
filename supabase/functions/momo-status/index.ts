// Poll MTN MoMo status for a pending transaction and settle wallet on success
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MOMO_HOST = "https://sandbox.momodeveloper.mtn.com";
const TARGET_ENV = "sandbox";

async function provisionSandboxApiUser(subKey: string, callbackHost: string) {
  const referenceId = crypto.randomUUID();
  const create = await fetch(`${MOMO_HOST}/v1_0/apiuser`, {
    method: "POST",
    headers: {
      "X-Reference-Id": referenceId,
      "Ocp-Apim-Subscription-Key": subKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ providerCallbackHost: new URL(callbackHost).host }),
  });
  if (!create.ok && create.status !== 409) throw new Error(await create.text());
  const keyRes = await fetch(`${MOMO_HOST}/v1_0/apiuser/${referenceId}/apikey`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": subKey },
  });
  const { apiKey } = await keyRes.json();
  return { apiUser: referenceId, apiKey };
}

async function getAccessToken(product: "collection" | "disbursement", subKey: string, apiUser: string, apiKey: string) {
  const basic = btoa(`${apiUser}:${apiKey}`);
  const res = await fetch(`${MOMO_HOST}/${product}/token/`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Ocp-Apim-Subscription-Key": subKey },
  });
  const { access_token } = await res.json();
  return access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const callbackHost = Deno.env.get("MTN_MOMO_CALLBACK_HOST")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { transaction_id } = await req.json();
    if (!transaction_id) {
      return new Response(JSON.stringify({ error: "transaction_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: tx } = await admin
      .from("transactions")
      .select("*")
      .eq("id", transaction_id)
      .eq("user_id", userData.user.id)
      .maybeSingle();
    if (!tx) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (tx.status === "completed" || tx.status === "failed") {
      return new Response(JSON.stringify({ status: tx.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: mr } = await admin
      .from("momo_requests")
      .select("*")
      .eq("transaction_id", tx.id)
      .maybeSingle();
    if (!mr) throw new Error("momo_request not found");

    const isDeposit = tx.type === "deposit";
    const product = isDeposit ? "collection" : "disbursement";
    const subKey = isDeposit
      ? Deno.env.get("MTN_MOMO_COLLECTIONS_SUBSCRIPTION_KEY")!
      : Deno.env.get("MTN_MOMO_DISBURSEMENTS_SUBSCRIPTION_KEY")!;
    const path = isDeposit ? "requesttopay" : "transfer";

    const { apiUser, apiKey } = await provisionSandboxApiUser(subKey, callbackHost);
    const token = await getAccessToken(product, subKey, apiUser, apiKey);

    const statusRes = await fetch(`${MOMO_HOST}/${product}/v1_0/${path}/${mr.reference_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Target-Environment": TARGET_ENV,
        "Ocp-Apim-Subscription-Key": subKey,
      },
    });
    const payload = await statusRes.json();
    const upstream = String(payload.status ?? "PENDING").toUpperCase();

    let newStatus: "pending" | "completed" | "failed" = "pending";
    if (upstream === "SUCCESSFUL") newStatus = "completed";
    else if (upstream === "FAILED") newStatus = "failed";

    await admin.from("momo_requests").update({
      status: newStatus, raw_response: payload, last_polled_at: new Date().toISOString(),
    }).eq("id", mr.id);

    if (newStatus !== tx.status) {
      await admin.from("transactions").update({ status: newStatus }).eq("id", tx.id);

      // Settle wallet on success
      if (newStatus === "completed" && tx.wallet_id) {
        const { data: w } = await admin.from("wallets").select("balance").eq("id", tx.wallet_id).single();
        const delta = isDeposit ? Number(tx.amount) : -Number(tx.amount);
        await admin.from("wallets").update({ balance: Number(w!.balance) + delta }).eq("id", tx.wallet_id);
      }
    }

    return new Response(JSON.stringify({ status: newStatus, upstream }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
