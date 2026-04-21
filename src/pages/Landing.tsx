import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Sparkles, Users } from "lucide-react";

const Landing = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-md min-h-screen flex flex-col">
      {/* Hero */}
      <div className="relative flex-1 flex flex-col px-6 pt-10 pb-8 overflow-hidden">
        <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-gradient-sun blur-3xl opacity-70" />
        <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-gradient-forest blur-3xl opacity-30" />
        <div className="absolute inset-0 pattern-adinkra opacity-[0.06]" />

        <header className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-gradient-warm shadow-warm flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground">S</span>
            </div>
            <span className="font-display font-semibold text-lg">SusuCircle</span>
          </div>
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
        </header>

        <div className="relative flex-1 flex flex-col justify-center py-10">
          <div className="inline-flex self-start items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1 text-xs font-medium text-muted-foreground mb-5 shadow-card animate-fade-up">
            <Sparkles className="h-3 w-3 text-accent" /> Trusted by 12,000+ savers in Ghana
          </div>
          <h1 className="font-display font-semibold text-[44px] leading-[1.05] text-balance animate-fade-up" style={{ animationDelay: '60ms' }}>
            Save together.<br />
            <span className="text-primary">Grow stronger.</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-balance leading-relaxed animate-fade-up" style={{ animationDelay: '120ms' }}>
            Start a digital susu with friends, family, or your community. Contribute on schedule, get paid in rotation — backed by mobile money you already use.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '180ms' }}>
            {[
              { icon: Users, label: "Trusted circles" },
              { icon: ShieldCheck, label: "Verified members" },
              { icon: Sparkles, label: "MoMo payouts" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl bg-card/70 border border-border/60 p-3 text-center shadow-card backdrop-blur">
                <Icon className="h-4 w-4 mx-auto text-primary mb-1.5" />
                <div className="text-[11px] font-medium leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative space-y-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
          <Link to="/signup" className="block">
            <Button size="lg" className="w-full h-14 text-base bg-gradient-warm shadow-warm hover:opacity-95 rounded-2xl">
              Get started — it's free
            </Button>
          </Link>
          <Link to="/app" className="block">
            <Button variant="outline" size="lg" className="w-full h-14 text-base rounded-2xl border-2">
              Explore the demo
            </Button>
          </Link>
          <p className="text-center text-[11px] text-muted-foreground pt-1">
            By continuing you agree to our Terms · 1% service fee per contribution
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Landing;
