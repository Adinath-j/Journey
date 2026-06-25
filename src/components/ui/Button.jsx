import { cn } from "@/lib/cn";

export function Button({ className, variant = "glass", type = "button", ...props }) {
  return <button type={type} className={cn("button-base", variant === "glass" ? "button-glass" : "button-ghost", className)} {...props} />;
}
