import { useState, useEffect } from "react";
import { Group } from "@/lib/types";
import { currency } from "@/lib/seed";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const methods = [
  { id: "mtn", name: "MTN MoMo", color: "bg-[hsl(48_95%_55%)]", text: "text-[hsl(20_30%_14%)]", logo: "M" },
  { id: "voda", name: "Vodafone Cash", color: "bg-[hsl(0_75%_50%)]", text: "text-white", logo: "V" },
  { id: "atl", name: "AirtelTigo Money", color: "bg-[hsl(220_85%_45%)]", text: "text-white", logo: "A" },
  { id: "wallet", name: "SusuCircle Wallet", color: "bg-gradient-warm", text: "text-primary-foreground", logo: "S" },
];

export const ContributeSheet = ({ open, onClose, group }: { open: boolean; onClose: () => void; group: Group }) => {
  const [method, setMethod] = useState("mtn");
  const [stage, setStage] = useState<"select" | "processing" | "success">("select");

  useEffect(() => { if (!open) { setStage("select"); setMethod("mtn"); } }, [open]);

  const fee = Math.round(group.contribution * 0.01);
  const total = group.contribution + fee;

  const submit = () => {
    setStage("processing");
    setTimeout(() => setStage("success"), 1600);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-up" />
      <div onClick={e => e.stopPropagation()} className="relative w-full max-w-md bg-card rounded-t-[2rem] sm:rounded-3xl shadow-warm animate-scale-in border-t border-border/60 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-card/95 backdrop-blur px-5 pt-3 pb-4 border-b border-border/60 flex items-center justify-between">
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-1 w-10 bg-muted rounded-full" />
          <h2 className="font-display font-semibold text-lg mt-2">Contribute</h2>
          <button onClick={onClose} className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center mt-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        {stage === "select" && (
          <div className="p-5 space-y-5">
            <div className="rounded-3xl bg-gradient-warm text-primary-foreground p-5 relative overflow-hidden shadow-warm">
              <div className="absolute inset-0 pattern-adinkra opacity-20" />
              <div className="relative">
                <div className="text-xs opacity-80 uppercase tracking-widest">{group.name}</div>
                <div className="font-display text-4xl font-semibold mt-1">{currency(group.contribution)}</div>
                <div className="text-xs opacity-85 mt-1">Cycle {group.cycleNumber + 1} contribution</div>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Pay with</div>
              <div className="space-y-2">
                {methods.map(m => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ease-soft text-left",
                      method === m.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-foreground/20"
                    )}>
                    <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center font-display font-bold text-lg", m.color, m.text)}>{m.logo}</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {m.id === "wallet" ? "Balance: " + currency(1240) : "+233 24 ••• 0142"}
                      </div>
                    </div>
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                      method === m.id ? "border-primary bg-primary" : "border-border"
                    )}>
                      {method === m.id && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-muted p-4 space-y-1.5 text-sm">
              <Row label="Contribution" value={currency(group.contribution)} />
              <Row label="Service fee (1%)" value={currency(fee)} muted />
              <div className="h-px bg-border my-1.5" />
              <Row label="Total" value={currency(total)} bold />
            </div>

            <Button onClick={submit} className="w-full h-14 rounded-2xl bg-gradient-warm shadow-warm text-base font-semibold">
              Confirm & pay {currency(total)}
            </Button>
          </div>
        )}

        {stage === "processing" && (
          <div className="p-10 text-center">
            <div className="relative h-20 w-20 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-warm animate-pulse-ring" />
              <div className="absolute inset-0 rounded-full bg-gradient-warm flex items-center justify-center text-2xl text-primary-foreground font-display">📲</div>
            </div>
            <h3 className="font-display text-xl font-semibold mt-6">Approve on your phone</h3>
            <p className="text-sm text-muted-foreground mt-2">We sent a prompt to your mobile money number. Enter your PIN to confirm.</p>
          </div>
        )}

        {stage === "success" && (
          <div className="p-10 text-center">
            <div className="h-20 w-20 mx-auto rounded-full bg-success/15 flex items-center justify-center">
              <div className="h-14 w-14 rounded-full bg-success flex items-center justify-center">
                <Check className="h-7 w-7 text-success-foreground" strokeWidth={3} />
              </div>
            </div>
            <h3 className="font-display text-2xl font-semibold mt-6">Contribution sent</h3>
            <p className="text-sm text-muted-foreground mt-2">{currency(total)} paid to {group.name}. You're on track for cycle {group.cycleNumber + 1}.</p>
            <Button onClick={onClose} className="w-full h-14 mt-8 rounded-2xl bg-gradient-warm shadow-warm">Done</Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className={cn(muted ? "text-muted-foreground" : "", bold ? "font-semibold" : "")}>{label}</span>
    <span className={cn("tabular-nums", bold ? "font-display font-semibold text-base" : "")}>{value}</span>
  </div>
);
