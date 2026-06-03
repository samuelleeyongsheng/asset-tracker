import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"    // muted gray — general purpose
  | "primary"    // dark/light — high emphasis
  | "success"    // green — free, active, positive
  | "crypto"     // amber — crypto assets
  | "stock"      // blue — stock assets
  | "outline";   // border only — subtle

type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;       // optional left icon or emoji
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default:
    "bg-muted text-muted-foreground border-transparent",
  primary:
    "bg-primary text-primary-foreground border-transparent",
  success:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
  crypto:
    "bg-amber-100 text-amber-800 border-transparent dark:bg-amber-950/60 dark:text-amber-400",
  stock:
    "bg-blue-100 text-blue-800 border-transparent dark:bg-blue-950/60 dark:text-blue-400",
  outline:
    "bg-transparent text-foreground border-border",
};

const sizes: Record<BadgeSize, string> = {
  sm: "text-[10px] px-2 py-px",
  md: "text-xs    px-3 py-1",
  lg: "text-sm    px-4 py-1.5",
};

export default function Badge({
  children,
  variant = "default",
  size = "md",
  icon,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}