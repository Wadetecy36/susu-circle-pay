import { Link } from "react-router-dom";
import { ChevronRight, Calendar } from "lucide-react";
import type { Group } from "@/lib/types";
import { currency, formatRelative } from "@/lib/seed";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

const accentBg = {
  warm: "bg-gradient-warm",
  forest: "bg-gradient-forest",
  earth: "bg-gradient-earth",
} as const;

export const GroupCard = ({ group }: { group: Group }) => {
  const progress = group.totalCycles ? (group.cycleNumber / group.totalCycles) * 100 : 0;
  const slotPct = (group.filledSlots / group.totalMembers) * 100;
  return (
    <Link to={`/app/groups/${group.id}`} className="block group">
      <div className="relative overflow-hidden rounded-3xl bg-card shadow-card border border-border/60 transition-all ease-soft hover:shadow-warm hover:-translate-y-0.5">
        <div className={cn("relative h-24 px-5 pt-4 pb-3 text-primary-foreground overflow-hidden", accentBg[group.accent])}>
          <div className="absolute inset-0 pattern-kente opacity-40" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-background/20 backdrop-blur flex items-center justify-center text-2xl">
                {group.emoji}
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest opacity-80">{group.category} · {group.frequency}</div>
                <h3 className="font-display font-semibold text-lg leading-tight">{group.name}</h3>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Contribution</div>
              <div className="font-display text-2xl font-semibold">{currency(group.contribution)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                <Calendar className="h-3 w-3" /> Next due
              </div>
              <div className="font-medium text-sm">{formatRelative(group.nextDueDate)}</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>{group.status === "forming" ? "Slots filled" : `Cycle ${group.cycleNumber} of ${group.totalCycles}`}</span>
              <span className="font-medium text-foreground">
                {group.status === "forming" ? `${group.filledSlots}/${group.totalMembers}` : `${Math.round(progress)}%`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-warm rounded-full transition-all ease-soft"
                style={{ width: `${group.status === "forming" ? slotPct : progress}%` }} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex -space-x-2">
              {group.members.slice(0, 4).map(m => <Avatar key={m.id} initials={m.initials} size="xs" you={m.isYou} />)}
              {group.members.length > 4 && (
                <div className="h-7 w-7 rounded-full bg-muted text-muted-foreground text-[10px] font-semibold flex items-center justify-center ring-2 ring-background">
                  +{group.members.length - 4}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Pot</div>
              <div className="font-semibold text-sm">{currency(group.potThisCycle)}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
