import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/seed";
import { ArrowDownToLine, ArrowUpFromLine, Eye, EyeOff, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MoMoSheet } from "@/components/MoMoSheet";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type Tx = {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  description: string | null;
  created_at: string;
  operator: string | null;
};

const Wallet = () => {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [sheet, setSheet] = useState<null | "deposit" | "withdraw">(null);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }
    const [{ data: wallet }, { data: txData }] = await Promise.all([
      supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle(),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setBalance(Number(wallet?.balance ?? 0));
    setTxs((txData ?? []) as Tx[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const totalIn = txs.filter(t => ["deposit", "payout"].includes(t.type) && t.status === "completed")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = txs.filter(t => ["withdrawal", "contribution", "fee"].includes(t.type) && t.status === "completed")
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <AppShell>
      <header className="px-5 pt-7">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Your wallet</p>
        <h1 className="font-display font-semibold text-3xl mt-0.5">Balance</h1>
      </header>

      <div className="px-5 mt-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-earth p-6 text-primary-foreground shadow-warm">
          <div className="absolute inset-0 pattern-kente opacity-25" />
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-sun blur-2xl opacity-60" />

          <div className="relative">
            <div className="flex items-center justify-between text-xs opacity-80">
              <span className="uppercase tracking-widest">Available</span>
              <button onClick={() => setHidden(h => !h)} className="h-8 w-8 rounded-full bg-background/15 flex items-center justify-center">
                {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="font-display font-semibold text-5xl tracking-tight mt-2 tabular-nums">
              {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : hidden ? "GH₵ ••••" : currency(balance)}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button onClick={() => setSheet("deposit")} className="h-12 rounded-2xl bg-card text-foreground hover:bg-card/90 font-semibold">
                <ArrowDownToLine className="h-4 w-4 mr-1.5" /> Top up
              </Button>
              <Button onClick={() => setSheet("withdraw")} variant="outline" className="h-12 rounded-2xl border-background/30 text-primary-foreground bg-background/10 hover:bg-background/20 font-semibold">
                <ArrowUpFromLine className="h-4 w-4 mr-1.5" /> Withdraw
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card border border-border/60 p-4">
          <div className="text-xs text-muted-foreground">Total in</div>
          <div className="font-display text-xl font-semibold text-success mt-1">+{currency(totalIn)}</div>
        </div>
        <div className="rounded-2xl bg-card border border-border/60 p-4">
          <div className="text-xs text-muted-foreground">Total out</div>
          <div className="font-display text-xl font-semibold mt-1">−{currency(totalOut)}</div>
        </div>
      </div>

      <section className="px-5 mt-7">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-semibold text-xl">Transactions</h2>
          <button onClick={load} className="text-sm text-primary font-medium">Refresh</button>
        </div>
        <div className="rounded-3xl bg-card border border-border/60 px-4 divide-y divide-border/60">
          {txs.length === 0 && !loading && (
            <div className="py-8 text-center text-sm text-muted-foreground">No transactions yet. Top up to get started.</div>
          )}
          {txs.map(tx => {
            const isIn = ["deposit", "payout"].includes(tx.type);
            return (
              <div key={tx.id} className="flex items-center gap-3 py-3.5">
                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", isIn ? "bg-success/15 text-success" : "bg-muted text-foreground")}>
                  {isIn ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate capitalize">{tx.description ?? tx.type}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(tx.created_at).toLocaleString()} · <span className="capitalize">{tx.status}</span>
                    {tx.operator && <> · {tx.operator.toUpperCase()}</>}
                  </div>
                </div>
                <div className={cn("font-display font-semibold tabular-nums", isIn ? "text-success" : "text-foreground", tx.status !== "completed" && "opacity-50")}>
                  {isIn ? "+" : "−"}{currency(Number(tx.amount))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <MoMoSheet open={!!sheet} mode={sheet ?? "deposit"} onClose={() => setSheet(null)} onSettled={load} />
    </AppShell>
  );
};

export default Wallet;
