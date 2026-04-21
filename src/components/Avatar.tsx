import { cn } from "@/lib/utils";

export const Avatar = ({
  initials, size = "md", you = false, className,
}: { initials: string; size?: "xs" | "sm" | "md" | "lg"; you?: boolean; className?: string }) => {
  const sizes = { xs: "h-7 w-7 text-[10px]", sm: "h-9 w-9 text-xs", md: "h-11 w-11 text-sm", lg: "h-16 w-16 text-lg" };
  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-semibold ring-2 ring-background",
      you ? "bg-gradient-warm text-primary-foreground" : "bg-secondary text-secondary-foreground",
      sizes[size], className
    )}>
      {initials}
    </div>
  );
};
