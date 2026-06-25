import type { PropsWithChildren } from "react";
import { cn } from "@/lib/cn";

interface PageContainerProps extends PropsWithChildren {
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return <main className={cn("mx-auto w-full max-w-[1430px] px-7 pb-7 pt-5 xl:px-9", className)}>{children}</main>;
}
