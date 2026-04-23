// MTN MoMo Disbursements - Transfer (withdraw)
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
  if (!create.ok && create.status !== 409) {
    throw new Error(`apiuser create failed: ${create.status} ${await create.text()}`);
  }
  const keyRes = await fetch(`${MOMO_HOST}/v1_0/apiuser/${referenceId}/apikey`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": subKey },
  });
  if (!keyRes.ok) throw new Error(`apikey failed: ${keyRes.status} ${await keyRes.text()}`);
  const { apiKey } = await keyRes.json();
  return { apiUser: referenceId, apiKey };
}

async function getAccessToken(subKey: string, apiUser: string, apiKey: string) {
  const basic = btoa(`${apiUser}:${apiKey}`);
  const res = await fetch(`${MOMO_HOST}/disbursement/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Ocp-Apim-Subscription-Key": subKey,
    },
  });
  if (!res.ok) throw new Error(`token failed: ${res.status} ${await res.text()}`);
  const { access_token } = await res.json();
  return access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const subKey = Deno.env.get("MTN_MOMO_DISBURSEMENTS_SUBSCRIPTION_KEY")!;
    const callbackHost = Deno.env.get("MTN_MOMO_CALLBACK_HOST")!;

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
    const phone = String(body.phone ?? "").replace(/\D/g, "");
    if (!amount || amount <= 0 || !phone) {
      return new Response(JSON.stringify({ error: "amount and phone are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Check wallet balance
    const { data: wallet } = await admin
      .from("wallets")
      .select("id, balance")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!wallet || Number(wallet.balance) < amount) {
      return new Response(JSON.stringify({ error: "Insufficient balance" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { apiUser, apiKey } = await provisionSandboxApiUser(subKey, callbackHost);
    const token = await getAccessToken(subKey, apiUser, apiKey);

    const referenceId = crypto.randomUUID();
    const externalId = `wd_${Date.now()}`;

    const trRes = await fetch(`${MOMO_HOST}/disbursement/v1_0/transfer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": TARGET_ENV,
        "Ocp-Apim-Subscription-Key": subKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: String(amount),
        currency: "EUR",
        externalId,
        payee: { partyIdType: "MSISDN", partyId: phone },
        payerMessage: "SusuCircle withdrawal",
        payeeNote: "Wallet withdrawal",
      }),
    });

    if (trRes.status !== 202) {
      const txt = await trRes.text();
      return new Response(JSON.stringify({ error: "MoMo transfer failed", details: txt }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: tx, error: txErr } = await admin
      .from("transactions")
      .insert({
        user_id: user.id,
        wallet_id: wallet.id,
        type: "withdrawal",
        status: "pending",
        amount,
        currency: "GHS",
        operator: "mtn",
        phone_number: phone,
        external_id: externalId,
        description: "MTN MoMo withdrawal",
        metadata: { reference_id: referenceId },
      })
      .select()
      .single();
    if (txErr) throw txErr;

    await admin.from("momo_requests").insert({
      user_id: user.id,
      transaction_id: tx.id,
      operator: "mtn",
      direction: "disburse",
      reference_id: referenceId,
      status: "pending",
    });

    return new Response(
      JSON.stringify({ ok: true, transaction_id: tx.id, reference_id: referenceId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
