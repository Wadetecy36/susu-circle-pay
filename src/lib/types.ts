export type Frequency = "weekly" | "biweekly" | "monthly";
export type GroupStatus = "forming" | "active" | "completed" | "paused";
export type MemberStatus = "paid" | "due" | "late" | "received";

export interface Member {
  id: string;
  name: string;
  initials: string;
  trustScore: number; // 0-5
  position: number;
  status: MemberStatus;
  isYou?: boolean;
  payoutDate?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  emoji: string;
  contribution: number;       // per cycle, GHS
  frequency: Frequency;
  totalMembers: number;
  filledSlots: number;
  cycleNumber: number;
  totalCycles: number;
  nextDueDate: string;        // ISO
  status: GroupStatus;
  visibility: "public" | "private";
  inviteCode: string;
  yourPosition?: number;
  yourPayoutDate?: string;
  members: Member[];
  potThisCycle: number;
  category: string;
  accent: "warm" | "forest" | "earth";
}

export type TxType = "contribution" | "payout" | "deposit" | "withdrawal" | "fee";
export interface Transaction {
  id: string;
  type: TxType;
  amount: number;            // positive in/out depending on type
  date: string;              // ISO
  groupName?: string;
  method?: "MTN MoMo" | "Vodafone Cash" | "AirtelTigo" | "Wallet";
  status: "completed" | "pending" | "failed";
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  initials: string;
  joinedDate: string;
  trustScore: number;
  cyclesCompleted: number;
  walletBalance: number;
  currency: "GHS";
}
