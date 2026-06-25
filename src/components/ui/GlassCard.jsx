import { cn } from "@/lib/cn";

export function GlassCard({ children, className, as: Component = "section", interactive = false, ...props }) {
  return (
    <Component className={cn("glass-card", interactive && "glass-card-interactive", className)} {...props}>
      {children}
    </Component>
  );
}
