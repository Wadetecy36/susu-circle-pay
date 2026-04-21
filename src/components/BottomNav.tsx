import { NavLink, useLocation } from "react-router-dom";
import { Home, Users, Wallet, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/app", icon: Home, label: "Home" },
  { to: "/app/groups", icon: Users, label: "Groups" },
  { to: "/app/wallet", icon: Wallet, label: "Wallet" },
  { to: "/app/notifications", icon: Bell, label: "Alerts" },
  { to: "/app/profile", icon: User, label: "Profile" },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 mx-auto max-w-md">
      <div className="m-3 rounded-3xl border border-border/60 bg-card/85 backdrop-blur-xl shadow-warm">
        <ul className="grid grid-cols-5 px-2 py-2">
          {items.map(({ to, icon: Icon, label }) => {
            const active = pathname === to || (to !== "/app" && pathname.startsWith(to));
            return (
              <li key={to}>
                <NavLink to={to} end={to === "/app"} className="block">
                  <div className={cn(
                    "flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all ease-soft",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                    <div className={cn(
                      "h-9 w-9 rounded-2xl flex items-center justify-center transition-all ease-soft",
                      active ? "bg-gradient-warm shadow-warm text-primary-foreground scale-105" : ""
                    )}>
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                    </div>
                    <span className="text-[10px] font-medium tracking-wide">{label}</span>
                  </div>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
