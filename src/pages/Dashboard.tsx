import { Link } from "react-router-dom";
import { Bell, Plus, ArrowUpRight, Sparkles, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GroupCard } from "@/components/GroupCard";
import { TransactionRow } from "@/components/TransactionRow";
import { Button } from "@/components/ui/button";
import { groups, transactions, me, currency, formatRelative } from "@/lib/seed";

const Dashboard = () => {
  const active = groups.filter(g => g.status === "active");
  const nextDue = [...active].sort((a,b) => +new Date(a.nextDueDate) - +new Date(b.nextDueDate))[0];
  const totalContributed = active.reduce((s, g) => s + g.contribution * g.cycleNumber, 0);

  return (
    <AppShell>
      {/* Hero header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-earth" />
        <div className="absolute inset-0 pattern-kente opacity-25" />
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-sun blur-3xl opacity-50" />

        <div className="relative px-5 pt-6 pb-24 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest opacity-70">Akwaaba 👋</p>
              <h1 className="font-display font-semibold text-2xl mt-0.5">{me.name.split(" ")[0]}</h1>
            </div>
            <Link to="/app/notifications" className="relative h-11 w-11 rounded-2xl bg-background/15 backdrop-blur flex items-center justify-center">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-[hsl(20,38%,18%)]" />
            </Link>
          </div>

          <div className="mt-7">
            <div className="flex items-center gap-2 text-xs opacity-80">
              <Sparkles className="h-3 w-3" /> Wallet balance
            </div>
            <div className="mt-1 flex items-end gap-2">
              <span className="font-display font-semibold text-5xl tracking-tight">{currency(me.walletBalance)}</span>
            </div>
            <div className="mt-1 text-xs opacity-75">
              Saved this year · <span className="font-medium opacity-100">{currency(totalContributed)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating wallet actions */}
      <div className="px-5 -mt-16 relative z-10">
        <div className="rounded-3xl bg-card shadow-warm border border-border/60 p-2 grid grid-cols-3 gap-1">
          {[
            { to: "/app/wallet?action=deposit", label: "Top up", icon: "+" },
            { to: "/app/wallet?action=withdraw", label: "Withdraw", icon: "↗" },
            { to: "/app/groups/new", label: "New susu", icon: "✦" },
          ].map(a => (
            <Link key={a.label} to={a.to} className="flex flex-col items-center gap-1 py-3 rounded-2xl hover:bg-muted transition-colors">
              <div className="h-10 w-10 rounded-2xl bg-gradient-warm text-primary-foreground font-semibold flex items-center justify-center shadow-warm">
                {a.icon}
              </div>
              <span className="text-xs font-medium">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Next contribution */}
      {nextDue && (
        <div className="px-5 mt-6">
          <Link to={`/app/groups/${nextDue.id}`} className="block">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-warm p-5 text-primary-foreground shadow-warm">
              <div className="absolute inset-0 pattern-adinkra opacity-20" />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-widest opacity-80">Next contribution</div>
                  <div className="font-display text-2xl font-semibold mt-1">{currency(nextDue.contribution)}</div>
                  <div className="text-sm opacity-90 mt-0.5">{nextDue.name} · {formatRelative(nextDue.nextDueDate)}</div>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-background/20 backdrop-blur flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
              <Button size="sm" className="relative mt-4 bg-card text-foreground hover:bg-card/90 rounded-xl font-semibold">
                Pay with MoMo
              </Button>
            </div>
          </Link>
        </div>
      )}

      {/* Active groups */}
      <section className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-xl">Your circles</h2>
          <Link to="/app/groups" className="text-sm text-primary font-medium flex items-center gap-1">
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-4">
          {active.slice(0, 2).map(g => <GroupCard key={g.id} group={g} />)}
        </div>
      </section>

      {/* Recent activity */}
      <section className="px-5 mt-7">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-semibold text-xl">Recent activity</h2>
          <Link to="/app/wallet" className="text-sm text-primary font-medium">View all</Link>
        </div>
        <div className="rounded-3xl bg-card border border-border/60 px-4 divide-y divide-border/60">
          {transactions.slice(0, 4).map(tx => <TransactionRow key={tx.id} tx={tx} />)}
        </div>
      </section>

      <div className="px-5 mt-7">
        <Link to="/app/groups/new">
          <Button variant="outline" size="lg" className="w-full h-14 rounded-2xl border-2 border-dashed">
            <Plus className="h-4 w-4 mr-2" /> Start a new susu
          </Button>
        </Link>
      </div>
    </AppShell>
  );
};

export default Dashboard;
