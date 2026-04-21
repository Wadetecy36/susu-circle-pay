import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { currency } from "@/lib/seed";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const emojis = ["🧺","🎓","🚖","💇🏾‍♀️","💻","🎣","🌸","🏠","💼","🛍️","⚽","🍲"];
const frequencies = [
  { id: "weekly", label: "Weekly" },
  { id: "biweekly", label: "Bi-weekly" },
  { id: "monthly", label: "Monthly" },
];

const NewGroup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🧺");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(200);
  const [members, setMembers] = useState(8);
  const [freq, setFreq] = useState("weekly");
  const [vis, setVis] = useState<"public" | "private">("private");

  const next = () => step < 3 ? setStep(step + 1) : navigate("/app/groups");
  const back = () => step > 1 ? setStep(step - 1) : navigate("/app/groups");

  return (
    <AppShell>
      <PageHeader title="Start a new susu" back="/app/groups" subtitle={`Step ${step} of 3`} />

      {/* Progress */}
      <div className="px-5 pt-2">
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3].map(i => (
            <div key={i} className={cn("h-1.5 rounded-full transition-all ease-soft", i <= step ? "bg-gradient-warm" : "bg-muted")} />
          ))}
        </div>
      </div>

      <div className="px-5 mt-6 space-y-5">
        {step === 1 && (
          <>
            <div>
              <h2 className="font-display text-2xl font-semibold">Name your circle</h2>
              <p className="text-sm text-muted-foreground mt-1">Give it a name your members will recognise.</p>
            </div>
            <div>
              <Label>Pick an icon</Label>
              <div className="mt-2 grid grid-cols-6 gap-2">
                {emojis.map(e => (
                  <button key={e} onClick={() => setEmoji(e)}
                    className={cn(
                      "aspect-square rounded-2xl text-2xl flex items-center justify-center transition-all ease-soft",
                      emoji === e ? "bg-gradient-warm shadow-warm scale-105" : "bg-muted hover:bg-muted/70"
                    )}>{e}</button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="name">Group name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Family Susu 2026" className="mt-1.5 h-12 rounded-2xl" />
            </div>
            <div>
              <Label htmlFor="desc">Purpose (optional)</Label>
              <Textarea id="desc" value={desc} onChange={e => setDesc(e.target.value)} placeholder="What are you saving for together?" className="mt-1.5 rounded-2xl min-h-24" />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="font-display text-2xl font-semibold">Set the rules</h2>
              <p className="text-sm text-muted-foreground mt-1">Amount, members and frequency.</p>
            </div>

            <div className="rounded-3xl bg-gradient-warm p-6 text-primary-foreground text-center shadow-warm relative overflow-hidden">
              <div className="absolute inset-0 pattern-adinkra opacity-20" />
              <div className="relative">
                <div className="text-xs uppercase tracking-widest opacity-80">Each member contributes</div>
                <div className="font-display text-5xl font-semibold mt-2 tabular-nums">{currency(amount)}</div>
                <div className="text-sm opacity-85 mt-1">{frequencies.find(f => f.id === freq)?.label.toLowerCase()}</div>
                <input type="range" min={50} max={2000} step={50} value={amount} onChange={e => setAmount(+e.target.value)}
                  className="w-full mt-4 accent-accent" />
              </div>
            </div>

            <div>
              <Label>Frequency</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {frequencies.map(f => (
                  <button key={f.id} onClick={() => setFreq(f.id)}
                    className={cn(
                      "py-3 rounded-2xl text-sm font-medium border-2 transition-all ease-soft",
                      freq === f.id ? "border-primary bg-primary/5 text-foreground" : "border-border bg-card text-muted-foreground"
                    )}>{f.label}</button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label>Number of members</Label>
                <span className="font-display text-lg font-semibold">{members}</span>
              </div>
              <input type="range" min={3} max={20} value={members} onChange={e => setMembers(+e.target.value)}
                className="w-full mt-2 accent-primary" />
              <div className="mt-3 rounded-2xl bg-muted p-3 text-sm text-muted-foreground">
                Total pot per cycle: <span className="font-semibold text-foreground">{currency(amount * members)}</span> · Cycle ends in <span className="font-semibold text-foreground">{members} {freq === "weekly" ? "weeks" : freq === "biweekly" ? "fortnights" : "months"}</span>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="font-display text-2xl font-semibold">Visibility & rules</h2>
              <p className="text-sm text-muted-foreground mt-1">Who can join, and what happens if someone is late.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "private" as const, title: "Private", desc: "Invite only, by code." },
                { id: "public" as const, title: "Public", desc: "Discoverable in browse." },
              ].map(o => (
                <button key={o.id} onClick={() => setVis(o.id)}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-left transition-all ease-soft",
                    vis === o.id ? "border-primary bg-primary/5" : "border-border bg-card"
                  )}>
                  <div className="font-semibold">{o.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{o.desc}</div>
                </button>
              ))}
            </div>

            <div className="rounded-2xl bg-card border border-border/60 divide-y divide-border/60">
              {[
                { l: "Late penalty", v: "5% per day", on: true },
                { l: "Auto-pay from wallet", v: "On due date", on: true },
                { l: "Require KYC to join", v: "Verified ID", on: false },
              ].map(r => (
                <div key={r.l} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{r.l}</div>
                    <div className="text-xs text-muted-foreground">{r.v}</div>
                  </div>
                  <div className={cn("h-6 w-11 rounded-full flex items-center px-0.5 transition-all", r.on ? "bg-primary justify-end" : "bg-muted justify-start")}>
                    <div className="h-5 w-5 rounded-full bg-card shadow-card" />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl bg-gradient-forest p-5 text-secondary-foreground relative overflow-hidden">
              <div className="absolute inset-0 pattern-kente opacity-25" />
              <div className="relative">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
                  <Check className="h-3 w-3" /> Ready
                </div>
                <div className="font-display text-xl font-semibold mt-1">{emoji} {name || "Untitled susu"}</div>
                <div className="text-sm opacity-85 mt-1">
                  {members} members · {currency(amount)} {frequencies.find(f=>f.id===freq)?.label.toLowerCase()} · {vis}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="px-5 mt-8 flex gap-2">
        <Button variant="outline" onClick={back} className="h-14 rounded-2xl border-2 px-6">Back</Button>
        <Button onClick={next} className="h-14 rounded-2xl bg-gradient-warm shadow-warm flex-1 text-base font-semibold">
          {step === 3 ? "Create circle" : "Continue"}
        </Button>
      </div>
    </AppShell>
  );
};

export default NewGroup;
