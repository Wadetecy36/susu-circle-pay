import { AppShell } from "@/components/AppShell";
import { Bell, Coins, Crown, AlertTriangle, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { id: 1, icon: Coins, tone: "warm", title: "Contribution due in 3 days", body: "Makola Market Traders · GH₵ 200", time: "2h ago", unread: true },
  { id: 2, icon: Crown, tone: "accent", title: "Payout received 🎉", body: "GH₵ 1,200 added to your wallet from Kumasi Hair Salon Group.", time: "5d ago", unread: true },
  { id: 3, icon: Users, tone: "forest", title: "New member joined", body: "Mansa Botwe joined Bolt Drivers Cooperative.", time: "1w ago", unread: false },
  { id: 4, icon: AlertTriangle, tone: "destructive", title: "Late contribution", body: "Abena Frimpong missed cycle 4 in Makola Market Traders.", time: "1w ago", unread: false },
  { id: 5, icon: Sparkles, tone: "warm", title: "You earned a badge", body: "7 cycles completed · Trust score +0.2", time: "2w ago", unread: false },
];

const tones: Record<string, string> = {
  warm: "bg-gradient-warm text-primary-foreground",
  forest: "bg-gradient-forest text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  destructive: "bg-destructive/15 text-destructive",
};

const Notifications = () => (
  <AppShell>
    <header className="px-5 pt-7 flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Inbox</p>
        <h1 className="font-display font-semibold text-3xl mt-0.5">Alerts</h1>
      </div>
      <button className="text-sm text-primary font-semibold">Mark all read</button>
    </header>

    <section className="px-5 mt-5 space-y-2">
      {items.map(n => {
        const Icon = n.icon;
        return (
          <div key={n.id} className={cn(
            "flex gap-3 p-4 rounded-2xl border transition-all ease-soft",
            n.unread ? "bg-card border-border/60 shadow-card" : "bg-transparent border-border/40"
          )}>
            <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0", tones[n.tone])}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-sm leading-snug">{n.title}</div>
                {n.unread && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5 leading-snug">{n.body}</div>
              <div className="text-[11px] text-muted-foreground mt-1.5">{n.time}</div>
            </div>
          </div>
        );
      })}
    </section>
  </AppShell>
);

export default Notifications;
