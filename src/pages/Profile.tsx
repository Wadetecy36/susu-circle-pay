import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { me, currency, groups } from "@/lib/seed";
import { Star, Shield, Settings, HelpCircle, LogOut, ChevronRight, Crown, Sparkles, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  const items = [
    { icon: Shield, label: "KYC verification", value: "Verified", to: "#" },
    { icon: Settings, label: "Account settings", to: "#" },
    { icon: HelpCircle, label: "Help & support", to: "#" },
  ];

  return (
    <AppShell>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-forest" />
        <div className="absolute inset-0 pattern-kente opacity-25" />
        <div className="relative px-5 pt-7 pb-12 text-secondary-foreground text-center">
          <Avatar initials={me.initials} size="lg" you className="mx-auto" />
          <h1 className="font-display font-semibold text-2xl mt-3">{me.name}</h1>
          <div className="text-sm opacity-80">{me.phone}</div>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/15 backdrop-blur text-xs font-semibold">
            <BadgeCheck className="h-3.5 w-3.5 text-accent" /> Verified member
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 -mt-7">
        <div className="rounded-3xl bg-card shadow-warm border border-border/60 p-5 grid grid-cols-3 gap-3 text-center">
          <Stat label="Trust" value={me.trustScore.toFixed(1)} icon={<Star className="h-3.5 w-3.5 fill-accent text-accent" />} />
          <div className="border-x border-border/60">
            <Stat label="Cycles" value={me.cyclesCompleted.toString()} />
          </div>
          <Stat label="Circles" value={groups.length.toString()} />
        </div>
      </div>

      {/* Premium */}
      <div className="px-5 mt-5">
        <div className="rounded-3xl bg-gradient-warm p-5 text-primary-foreground shadow-warm relative overflow-hidden">
          <div className="absolute inset-0 pattern-adinkra opacity-20" />
          <div className="relative flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-background/20 backdrop-blur flex items-center justify-center">
              <Crown className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <div className="font-display font-semibold text-lg leading-tight">SusuCircle Premium</div>
              <div className="text-xs opacity-85">Analytics, priority support, lower fees</div>
            </div>
            <Button size="sm" className="bg-card text-foreground hover:bg-card/90 font-semibold rounded-xl">Upgrade</Button>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="px-5 mt-6">
        <h2 className="font-display font-semibold text-lg mb-2">Achievements</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "🏆", label: "First payout" },
            { icon: "🔥", label: "7 cycles" },
            { icon: "⚡", label: "Always on time" },
          ].map(b => (
            <div key={b.label} className="rounded-2xl bg-card border border-border/60 p-3 text-center">
              <div className="text-2xl">{b.icon}</div>
              <div className="text-[11px] font-medium mt-1 leading-tight">{b.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings list */}
      <div className="px-5 mt-6">
        <div className="rounded-3xl bg-card border border-border/60 divide-y divide-border/60 overflow-hidden">
          {items.map(({ icon: Icon, label, value }) => (
            <button key={label} className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left">
              <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center">
                <Icon className="h-4 w-4" />
              </div>
              <span className="flex-1 font-medium text-sm">{label}</span>
              {value && <span className="text-xs text-success font-semibold">{value}</span>}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4">
        <Link to="/" className="flex items-center justify-center gap-2 py-4 text-destructive font-semibold text-sm">
          <LogOut className="h-4 w-4" /> Sign out
        </Link>
      </div>
    </AppShell>
  );
};

const Stat = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div>
    <div className="font-display text-2xl font-semibold flex items-center justify-center gap-1">{value}{icon}</div>
    <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">{label}</div>
  </div>
);

export default Profile;
