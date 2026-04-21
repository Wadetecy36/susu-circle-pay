import { useParams, Navigate, Link } from "react-router-dom";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { groups, currency, formatRelative } from "@/lib/seed";
import { Calendar, Users, Coins, Share2, Crown, Check, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { ContributeSheet } from "@/components/ContributeSheet";
import { cn } from "@/lib/utils";

const tabs = ["Rotation", "Members", "Activity"] as const;

const statusConfig = {
  paid:     { label: "Paid",     icon: Check,        cls: "bg-success/15 text-success" },
  due:      { label: "Due",      icon: Clock,        cls: "bg-muted text-muted-foreground" },
  late:     { label: "Late",     icon: AlertTriangle,cls: "bg-destructive/15 text-destructive" },
  received: { label: "Paid out", icon: Crown,        cls: "bg-accent/25 text-accent-foreground" },
} as const;

const GroupDetail = () => {
  const { id } = useParams();
  const group = groups.find(g => g.id === id);
  const [tab, setTab] = useState<typeof tabs[number]>("Rotation");
  const [payOpen, setPayOpen] = useState(false);
  if (!group) return <Navigate to="/app/groups" />;

  const progress = group.totalCycles ? (group.cycleNumber / group.totalCycles) * 100 : 0;
  const accentBg = { warm: "bg-gradient-warm", forest: "bg-gradient-forest", earth: "bg-gradient-earth" }[group.accent];

  return (
    <AppShell>
      <PageHeader title={group.name} back="/app/groups"
        right={<button className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center"><Share2 className="h-4 w-4" /></button>} />

      {/* Hero */}
      <div className={cn("relative overflow-hidden text-primary-foreground", accentBg)}>
        <div className="absolute inset-0 pattern-kente opacity-30" />
        <div className="relative p-5">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-background/20 backdrop-blur flex items-center justify-center text-3xl">
              {group.emoji}
            </div>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-widest opacity-80">{group.category} · {group.frequency}</div>
              <div className="font-medium opacity-95 text-sm">{group.description}</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <Stat icon={Coins} label="Per cycle" value={currency(group.contribution)} />
            <Stat icon={Users} label="Members" value={`${group.filledSlots}/${group.totalMembers}`} />
            <Stat icon={Calendar} label="Next due" value={formatRelative(group.nextDueDate)} />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="opacity-80">Cycle {group.cycleNumber} of {group.totalCycles}</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-background/20 overflow-hidden">
              <div className="h-full bg-background/90 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="px-5 -mt-5 relative z-10">
        <div className="rounded-3xl bg-card shadow-warm border border-border/60 p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Your next payout</div>
            <div className="font-display text-lg font-semibold">
              {group.yourPayoutDate ? formatRelative(group.yourPayoutDate) : "—"}
              <span className="text-sm font-medium text-muted-foreground ml-2">· #{group.yourPosition ?? "?"}</span>
            </div>
          </div>
          <Button onClick={() => setPayOpen(true)} className="h-12 rounded-2xl bg-gradient-warm shadow-warm font-semibold px-5">
            Contribute
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-6">
        <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-2xl">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all ease-soft ${
                tab === t ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
              }`}>{t}</button>
          ))}
        </div>
      </div>

      <section className="px-5 mt-5 space-y-2">
        {tab === "Rotation" && group.members.map(m => {
          const s = statusConfig[m.status]; const SI = s.icon;
          const isCurrent = m.position === group.cycleNumber + 1;
          return (
            <div key={m.id} className={cn(
              "flex items-center gap-3 p-3 rounded-2xl border transition-all ease-soft",
              isCurrent ? "border-primary/40 bg-primary/5 shadow-card" : "border-border/60 bg-card"
            )}>
              <div className="relative">
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center font-display font-semibold text-sm",
                  isCurrent ? "bg-gradient-warm text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>{m.position}</div>
                {isCurrent && <span className="absolute -inset-0.5 rounded-xl border-2 border-primary/40 animate-pulse-ring" />}
              </div>
              <Avatar initials={m.initials} size="sm" you={m.isYou} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {m.name} {m.isYou && <span className="text-xs text-primary font-semibold">· You</span>}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {isCurrent ? "Receiving this cycle" : m.status === "received" ? "Already paid out" : "Awaiting rotation"}
                </div>
              </div>
              <div className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold", s.cls)}>
                <SI className="h-3 w-3" /> {s.label}
              </div>
            </div>
          );
        })}

        {tab === "Members" && group.members.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/60">
            <Avatar initials={m.initials} size="sm" you={m.isYou} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{m.name} {m.isYou && <span className="text-xs text-primary">· You</span>}</div>
              <div className="text-[11px] text-muted-foreground">⭐ {m.trustScore.toFixed(1)} trust score</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}

        {tab === "Activity" && (
          <div className="rounded-3xl bg-card border border-border/60 p-5 text-sm space-y-4">
            {[
              { who: "Adjoa Nyarko", what: "contributed", when: "2h ago", amount: currency(group.contribution) },
              { who: "You", what: "contributed", when: "Yesterday", amount: currency(group.contribution) },
              { who: "Akosua Mensah", what: "received payout", when: "3 days ago", amount: currency(group.potThisCycle) },
              { who: "Cycle 4", what: "started", when: "5 days ago", amount: "" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <div className="text-sm"><span className="font-semibold">{a.who}</span> {a.what} {a.amount && <span className="text-primary font-semibold">{a.amount}</span>}</div>
                  <div className="text-[11px] text-muted-foreground">{a.when}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Invite */}
      <div className="px-5 mt-6">
        <div className="rounded-3xl border-2 border-dashed border-border p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Invite code</div>
            <div className="font-display font-semibold text-lg tracking-wider">{group.inviteCode}</div>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl"><Share2 className="h-4 w-4 mr-1.5" /> Share</Button>
        </div>
      </div>

      <ContributeSheet open={payOpen} onClose={() => setPayOpen(false)} group={group} />
    </AppShell>
  );
};

const Stat = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-2xl bg-background/15 backdrop-blur p-3">
    <Icon className="h-3.5 w-3.5 opacity-80" />
    <div className="text-[10px] uppercase tracking-widest opacity-70 mt-1">{label}</div>
    <div className="font-display font-semibold text-base mt-0.5 leading-tight">{value}</div>
  </div>
);

export default GroupDetail;
