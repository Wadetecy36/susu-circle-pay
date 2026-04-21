import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export const AppShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-md min-h-screen relative">
      <main className="pb-32">{children}</main>
      <BottomNav />
    </div>
  </div>
);
