import { ArrowDownLeft, ArrowUpRight, Receipt, Wallet as WalletIcon, Banknote } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { currency, formatRelative } from "@/lib/seed";
import { cn } from "@/lib/utils";

const config = {
  contribution: { label: "Contribution", icon: ArrowUpRight, tone: "text-foreground", bg: "bg-muted" },
  payout: { label: "Payout received", icon: ArrowDownLeft, tone: "text-success", bg: "bg-success/10" },
  deposit: { label: "Wallet top-up", icon: WalletIcon, tone: "text-foreground", bg: "bg-accent/15" },
  withdrawal: { label: "Withdrawal", icon: Banknote, tone: "text-foreground", bg: "bg-muted" },
  fee: { label: "Service fee", icon: Receipt, tone: "text-muted-foreground", bg: "bg-muted" },
} as const;

export const TransactionRow = ({ tx }: { tx: Transaction }) => {
  const c = config[tx.type];
  const Icon = c.icon;
  const positive = tx.amount > 0;
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center", c.bg, c.tone)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{c.label}</div>
        <div className="text-xs text-muted-foreground truncate">
          {tx.groupName ?? tx.method} · {formatRelative(tx.date)}
        </div>
      </div>
      <div className={cn("font-semibold tabular-nums text-sm", positive ? "text-success" : "text-foreground")}>
        {positive ? "+" : ""}{currency(tx.amount)}
      </div>
    </div>
  );
};
