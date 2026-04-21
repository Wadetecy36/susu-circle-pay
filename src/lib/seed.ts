import type { Group, Transaction, UserProfile, Member } from "./types";

export const currency = (n: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS", maximumFractionDigits: 0 }).format(n);

export const me: UserProfile = {
  name: "Ama Boateng",
  phone: "+233 24 555 0142",
  email: "ama@susucircle.app",
  initials: "AB",
  joinedDate: "2024-09-12",
  trustScore: 4.8,
  cyclesCompleted: 7,
  walletBalance: 1240,
  currency: "GHS",
};

const mk = (id: string, name: string, pos: number, status: Member["status"], isYou = false): Member => ({
  id, name, initials: name.split(" ").map(p => p[0]).slice(0, 2).join(""),
  trustScore: 3.5 + Math.random() * 1.5, position: pos, status, isYou,
});

export const groups: Group[] = [
  {
    id: "g1",
    name: "Makola Market Traders",
    description: "Weekly susu for market women in Accra Central.",
    emoji: "🧺",
    contribution: 200,
    frequency: "weekly",
    totalMembers: 10,
    filledSlots: 10,
    cycleNumber: 4,
    totalCycles: 10,
    nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    status: "active",
    visibility: "private",
    inviteCode: "MAKOLA-7K2",
    yourPosition: 6,
    yourPayoutDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    potThisCycle: 2000,
    category: "Trade",
    accent: "warm",
    members: [
      mk("m1", "Akosua Mensah", 1, "received"),
      mk("m2", "Yaw Owusu", 2, "received"),
      mk("m3", "Efua Sarpong", 3, "received"),
      mk("m4", "Kojo Asante", 4, "received"),
      mk("m5", "Adjoa Nyarko", 5, "paid"),
      mk("m6", "Ama Boateng", 6, "paid", true),
      mk("m7", "Kwesi Tetteh", 7, "due"),
      mk("m8", "Abena Frimpong", 8, "late"),
      mk("m9", "Kofi Adjei", 9, "due"),
      mk("m10", "Esi Quaye", 10, "due"),
    ],
  },
  {
    id: "g2",
    name: "KNUST Alumni Circle",
    description: "Monthly contribution toward home down-payments.",
    emoji: "🎓",
    contribution: 1000,
    frequency: "monthly",
    totalMembers: 12,
    filledSlots: 12,
    cycleNumber: 2,
    totalCycles: 12,
    nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 9).toISOString(),
    status: "active",
    visibility: "private",
    inviteCode: "KNUST-AL12",
    yourPosition: 9,
    yourPayoutDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 220).toISOString(),
    potThisCycle: 12000,
    category: "Housing",
    accent: "forest",
    members: Array.from({ length: 12 }).map((_, i) =>
      mk(`a${i}`, ["Nana Akoto","Yaa Owusu","Kweku Boahen","Abena Mensah","Kojo Manu","Ama Boateng","Yaw Sarpong","Efia Adjei","Kwame Owusu","Kobby Tetteh","Adwoa Asare","Fiifi Annan"][i], i+1,
        i < 1 ? "received" : i === 5 ? "paid" : i < 6 ? "paid" : "due", i === 5)
    ),
  },
  {
    id: "g3",
    name: "Bolt Drivers Cooperative",
    description: "Bi-weekly fund for vehicle maintenance & insurance.",
    emoji: "🚖",
    contribution: 350,
    frequency: "biweekly",
    totalMembers: 8,
    filledSlots: 6,
    cycleNumber: 0,
    totalCycles: 8,
    nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    status: "forming",
    visibility: "public",
    inviteCode: "BOLT-DR8",
    potThisCycle: 2800,
    category: "Transport",
    accent: "earth",
    members: Array.from({ length: 6 }).map((_, i) => mk(`b${i}`, ["Kwabena Osei","Yaw Mintah","Kojo Annor","Esi Adjei","Nii Lartey","Mansa Botwe"][i], i+1, "due")),
  },
  {
    id: "g4",
    name: "Kumasi Hair Salon Group",
    description: "Weekly susu — equipment & rent support.",
    emoji: "💇🏾‍♀️",
    contribution: 150,
    frequency: "weekly",
    totalMembers: 8,
    filledSlots: 8,
    cycleNumber: 6,
    totalCycles: 8,
    nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
    status: "active",
    visibility: "private",
    inviteCode: "KSI-HAIR",
    yourPosition: 3,
    potThisCycle: 1200,
    category: "Beauty",
    accent: "warm",
    members: Array.from({ length: 8 }).map((_, i) =>
      mk(`c${i}`, ["Akua Pomaa","Adjoa Mensah","Ama Boateng","Yaa Tiwaa","Akosua Owusu","Esi Donkor","Abena Sarfo","Maame Yaa"][i], i+1,
        i < 5 ? "received" : i === 2 ? "received" : i === 5 ? "paid" : "due", i === 2)
    ),
  },
];

export const browseGroups: Group[] = [
  {
    id: "p1", name: "Tema Tech Workers", description: "Monthly savings for a shared co-working space.",
    emoji: "💻", contribution: 500, frequency: "monthly", totalMembers: 10, filledSlots: 7,
    cycleNumber: 0, totalCycles: 10, nextDueDate: new Date(Date.now()+1000*60*60*24*5).toISOString(),
    status: "forming", visibility: "public", inviteCode: "TECHTM",
    potThisCycle: 5000, category: "Tech", accent: "forest", members: [],
  },
  {
    id: "p2", name: "Cape Coast Fishermen", description: "Bi-weekly fund for nets and engine repair.",
    emoji: "🎣", contribution: 250, frequency: "biweekly", totalMembers: 12, filledSlots: 9,
    cycleNumber: 0, totalCycles: 12, nextDueDate: new Date(Date.now()+1000*60*60*24*6).toISOString(),
    status: "forming", visibility: "public", inviteCode: "CCFISH",
    potThisCycle: 3000, category: "Fishing", accent: "earth", members: [],
  },
  {
    id: "p3", name: "Young Mothers Accra", description: "Weekly susu toward childcare and education.",
    emoji: "🌸", contribution: 100, frequency: "weekly", totalMembers: 15, filledSlots: 11,
    cycleNumber: 0, totalCycles: 15, nextDueDate: new Date(Date.now()+1000*60*60*24*4).toISOString(),
    status: "forming", visibility: "public", inviteCode: "YMA15",
    potThisCycle: 1500, category: "Family", accent: "warm", members: [],
  },
];

export const transactions: Transaction[] = [
  { id: "t1", type: "contribution", amount: -200, date: new Date(Date.now()-1000*60*60*24*1).toISOString(), groupName: "Makola Market Traders", method: "MTN MoMo", status: "completed" },
  { id: "t2", type: "payout", amount: +1200, date: new Date(Date.now()-1000*60*60*24*5).toISOString(), groupName: "Kumasi Hair Salon Group", method: "Wallet", status: "completed" },
  { id: "t3", type: "deposit", amount: +500, date: new Date(Date.now()-1000*60*60*24*7).toISOString(), method: "MTN MoMo", status: "completed" },
  { id: "t4", type: "contribution", amount: -1000, date: new Date(Date.now()-1000*60*60*24*9).toISOString(), groupName: "KNUST Alumni Circle", method: "Vodafone Cash", status: "completed" },
  { id: "t5", type: "fee", amount: -2, date: new Date(Date.now()-1000*60*60*24*9).toISOString(), groupName: "KNUST Alumni Circle", status: "completed" },
  { id: "t6", type: "withdrawal", amount: -300, date: new Date(Date.now()-1000*60*60*24*12).toISOString(), method: "MTN MoMo", status: "completed" },
  { id: "t7", type: "contribution", amount: -150, date: new Date(Date.now()-1000*60*60*24*14).toISOString(), groupName: "Kumasi Hair Salon Group", method: "AirtelTigo", status: "completed" },
];

export const formatRelative = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0 && days < 7) return `In ${days} days`;
  if (days < 0 && days > -7) return `${-days} days ago`;
  return new Date(iso).toLocaleDateString("en-GH", { day: "numeric", month: "short" });
};
