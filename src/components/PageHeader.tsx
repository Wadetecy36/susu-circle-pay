import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

export const PageHeader = ({
  title, back = "/app", right, subtitle,
}: { title: string; back?: string; right?: ReactNode; subtitle?: string }) => (
  <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/40">
    <div className="px-5 py-3.5 flex items-center gap-3">
      <Link to={back} className="h-10 w-10 -ml-2 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="flex-1 min-w-0">
        <h1 className="font-display font-semibold text-lg leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      {right}
    </div>
  </header>
);
