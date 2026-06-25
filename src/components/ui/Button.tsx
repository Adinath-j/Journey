import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "glass" | "ghost";
}

export function Button({ className, variant = "glass", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn("button-base", variant === "glass" ? "button-glass" : "button-ghost", className)} {...props} />;
}
