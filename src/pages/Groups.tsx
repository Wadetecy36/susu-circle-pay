import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { GroupCard } from "@/components/GroupCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { groups, browseGroups, currency } from "@/lib/seed";
import { Plus, Search, Hash } from "lucide-react";

const tabs = ["Mine", "Discover"] as const;

const Groups = () => {
  const [tab, setTab] = useState<typeof tabs[number]>("Mine");
  const [q, setQ] = useState("");

  const list = tab === "Mine" ? groups : browseGroups;
  const filtered = list.filter(g => g.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell>
      <header className="px-5 pt-7 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Susu groups</p>
            <h1 className="font-display font-semibold text-3xl mt-0.5">Circles</h1>
          </div>
          <Link to="/app/groups/new">
            <Button size="icon" className="h-11 w-11 rounded-2xl bg-gradient-warm shadow-warm">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Search + join code */}
      <div className="px-5 mt-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search groups…"
            className="pl-10 h-12 rounded-2xl bg-card" />
        </div>
        <Button variant="outline" className="h-12 rounded-2xl border-2 px-3 gap-1.5">
          <Hash className="h-4 w-4" /> Join
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-4">
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-2xl">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all ease-soft ${
                tab === t ? "bg-card text-foreground shadow-card" : "text-muted-foreground"
              }`}>
              {t} {t === "Mine" && <span className="ml-1 text-xs opacity-70">{groups.length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <section className="px-5 mt-5 space-y-4">
        {tab === "Discover" && (
          <div className="rounded-3xl p-5 bg-gradient-forest text-secondary-foreground shadow-card relative overflow-hidden">
            <div className="absolute inset-0 pattern-kente opacity-25" />
            <div className="relative">
              <div className="text-xs uppercase tracking-widest opacity-80">Trending in Accra</div>
              <h3 className="font-display text-xl font-semibold mt-1">Open public circles near you</h3>
              <p className="text-sm opacity-85 mt-1">Browse verified groups with open slots.</p>
            </div>
          </div>
        )}
        {filtered.map(g => <GroupCard key={g.id} group={g} />)}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No groups match "{q}"</div>
        )}
      </section>

      {tab === "Mine" && (
        <div className="px-5 mt-6">
          <div className="rounded-3xl bg-card border border-border/60 p-5">
            <div className="text-xs text-muted-foreground">Total committed across circles</div>
            <div className="font-display text-2xl font-semibold mt-1">
              {currency(groups.reduce((s, g) => s + g.contribution * g.totalCycles, 0))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Groups;
