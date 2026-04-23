import { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/seed";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const operators = [
  { id: "mtn", name: "MTN MoMo", color: "bg-[hsl(48_95%_55%)]", text: "text-[hsl(20_30%_14%)]", logo: "M", enabled: true },
  { id: "vodafone", name: "Vodafone Cash", color: "bg-[hsl(0_75%_50%)]", text: "text-white", logo: "V", enabled: false },
  { id: "airteltigo", name: "AirtelTigo Money", color: "bg-[hsl(220_85%_45%)]", text: "text-white", logo: "A", enabled: false },
];

type Stage = "form" | "processing" | "success" | "failed";

export const MoMoSheet = ({
  open, onClose, mode, onSettled,
}: {
  open: boolean;
  onClose: () => void;
  mode: "deposit" | "withdraw";
  onSettled?: () => void;
}) => {
  const [operator, setOperator] = useState("mtn");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStage("form"); setAmount(""); setPhone(""); setErrorMsg(null); setOperator("mtn");
    }
  }, [open]);

  const fnName = mode === "deposit" ? "momo-deposit" : "momo-withdraw";
  const title = mode === "deposit" ? "Top up wallet" : "Withdraw funds";
  const action = mode === "deposit" ? "Receive into wallet" : "Send to mobile money";

  const submit = async () => {
    setErrorMsg(null);
    const amt = Number(amount);
    if (!amt || amt <= 0) { setErrorMsg("Enter a valid amount"); return; }
    if (!/^\d{9,12}$/.test(phone.replace(/\D/g, ""))) { setErrorMsg("Enter your MoMo phone number"); return; }
    setStage("processing");
    try {
      const { data, error } = await supabase.functions.invoke(fnName, {
        body: { amount: amt, phone: phone.replace(/\D/g, "") },
      });
      if (error) throw error;
      if (!data?.transaction_id) throw new Error("Unexpected response");

      // Poll for status
      const txId = data.transaction_id;
      let settled = false;
      for (let i = 0; i < 20 && !settled; i++) {
        await new Promise(r => setTimeout(r, 2500));
        const { data: s } = await supabase.functions.invoke("momo-status", { body: { transaction_id: txId } });
        if (s?.status === "completed") { setStage("success"); settled = true; break; }
        if (s?.status === "failed") { setStage("failed"); setErrorMsg("Payment was not approved"); settled = true; break; }
      }
      if (!settled) {
        setStage("success");
        toast({ title: "Still processing", description: "We'll update your balance once MTN confirms." });
      }
      onSettled?.();
    } catch (e: any) {
      setStage("failed");
      setErrorMsg(e.message ?? "Something went wrong");
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-up" />
      <div onClick={e => e.stopPropagation()} className="relative w-full max-w-md bg-card rounded-t-[2rem] sm:rounded-3xl shadow-warm animate-scale-in border-t border-border/60 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-card/95 backdrop-blur px-5 pt-3 pb-4 border-b border-border/60 flex items-center justify-between">
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-1 w-10 bg-muted rounded-full" />
          <h2 className="font-display font-semibold text-lg mt-2">{title}</h2>
          <button onClick={onClose} className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center mt-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        {stage === "form" && (
          <div className="p-5 space-y-5">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Operator</div>
              <div className="space-y-2">
                {operators.map(m => (
                  <button key={m.id} disabled={!m.enabled} onClick={() => setOperator(m.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ease-soft text-left",
                      operator === m.id ? "border-primary bg-primary/5" : "border-border bg-card",
                      !m.enabled && "opacity-50 cursor-not-allowed"
                    )}>
                    <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center font-display font-bold text-lg", m.color, m.text)}>{m.logo}</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {m.enabled ? action : "Coming soon"}
                      </div>
                    </div>
                    <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", operator === m.id ? "border-primary bg-primary" : "border-border")}>
                      {operator === m.id && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="amount">Amount (GH₵)</Label>
              <Input id="amount" type="number" inputMode="decimal" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="50" className="mt-1.5 h-12 rounded-2xl text-lg" />
            </div>

            <div>
              <Label htmlFor="phone">MoMo phone number</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-12 px-4 rounded-2xl border border-input bg-card flex items-center font-medium text-sm">🇬🇭 +233</div>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="24 555 0142" className="h-12 rounded-2xl flex-1" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">Sandbox tip: use 46733123450 for a successful test.</p>
            </div>

            {errorMsg && <div className="text-sm text-destructive">{errorMsg}</div>}

            <Button onClick={submit} className="w-full h-14 rounded-2xl bg-gradient-warm shadow-warm text-base font-semibold">
              {mode === "deposit" ? "Request payment" : "Send withdrawal"}
            </Button>
          </div>
        )}

        {stage === "processing" && (
          <div className="p-10 text-center">
            <div className="relative h-20 w-20 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-warm animate-pulse-ring" />
              <div className="absolute inset-0 rounded-full bg-gradient-warm flex items-center justify-center text-primary-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </div>
            <h3 className="font-display text-xl font-semibold mt-6">
              {mode === "deposit" ? "Approve on your phone" : "Sending to your phone"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {mode === "deposit"
                ? "We sent an MTN MoMo prompt. Enter your PIN to approve."
                : "Your withdrawal is being processed by MTN MoMo."}
            </p>
          </div>
        )}

        {stage === "success" && (
          <div className="p-10 text-center">
            <div className="h-20 w-20 mx-auto rounded-full bg-success/15 flex items-center justify-center">
              <div className="h-14 w-14 rounded-full bg-success flex items-center justify-center">
                <Check className="h-7 w-7 text-success-foreground" strokeWidth={3} />
              </div>
            </div>
            <h3 className="font-display text-2xl font-semibold mt-6">
              {mode === "deposit" ? "Top up complete" : "Withdrawal sent"}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {currency(Number(amount))} {mode === "deposit" ? "added to your wallet." : "sent to your MoMo number."}
            </p>
            <Button onClick={onClose} className="w-full h-14 mt-8 rounded-2xl bg-gradient-warm shadow-warm">Done</Button>
          </div>
        )}

        {stage === "failed" && (
          <div className="p-10 text-center">
            <div className="h-20 w-20 mx-auto rounded-full bg-destructive/15 flex items-center justify-center">
              <X className="h-10 w-10 text-destructive" strokeWidth={3} />
            </div>
            <h3 className="font-display text-2xl font-semibold mt-6">Payment failed</h3>
            <p className="text-sm text-muted-foreground mt-2">{errorMsg ?? "Please try again."}</p>
            <Button onClick={() => setStage("form")} className="w-full h-14 mt-8 rounded-2xl bg-gradient-warm shadow-warm">Try again</Button>
          </div>
        )}
      </div>
    </div>
  );
};
