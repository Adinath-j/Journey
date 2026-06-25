import { cn } from "@/lib/cn";

export function PageContainer({ children, className }) {
  return <main className={cn("mx-auto w-full max-w-[1430px] px-7 pb-7 pt-5 xl:px-9", className)}>{children}</main>;
}
