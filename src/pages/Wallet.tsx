import { AppShell } from "@/components/AppShell";
import { TransactionRow } from "@/components/TransactionRow";
import { Button } from "@/components/ui/button";
import { transactions, me, currency } from "@/lib/seed";
import { ArrowDownToLine, ArrowUpFromLine, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const Wallet = () => {
  const [hidden, setHidden] = useState(false);
  const totalIn = transactions.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.amount < 0).reduce((s,t) => s - t.amount, 0);

  return (
    <AppShell>
      <header className="px-5 pt-7">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Your wallet</p>
        <h1 className="font-display font-semibold text-3xl mt-0.5">Balance</h1>
      </header>

      {/* Balance card */}
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
              {hidden ? "GH₵ ••••" : currency(me.walletBalance)}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button className="h-12 rounded-2xl bg-card text-foreground hover:bg-card/90 font-semibold">
                <ArrowDownToLine className="h-4 w-4 mr-1.5" /> Top up
              </Button>
              <Button variant="outline" className="h-12 rounded-2xl border-background/30 text-primary-foreground bg-background/10 hover:bg-background/20 font-semibold">
                <ArrowUpFromLine className="h-4 w-4 mr-1.5" /> Withdraw
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* In/Out summary */}
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

      {/* Transactions */}
      <section className="px-5 mt-7">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-semibold text-xl">Transactions</h2>
          <button className="text-sm text-primary font-medium">Filter</button>
        </div>
        <div className="rounded-3xl bg-card border border-border/60 px-4 divide-y divide-border/60">
          {transactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
        </div>
      </section>
    </AppShell>
  );
};

export default Wallet;
