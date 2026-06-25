import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface GlassCardProps extends ComponentPropsWithoutRef<"section"> {
  children: ReactNode;
  as?: ElementType;
  interactive?: boolean;
}

export function GlassCard({ children, className, as: Component = "section", interactive = false, ...props }: GlassCardProps) {
  return (
    <Component className={cn("glass-card", interactive && "glass-card-interactive", className)} {...props}>
      {children}
    </Component>
  );
}
