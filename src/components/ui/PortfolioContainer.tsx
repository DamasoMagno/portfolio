import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PortfolioContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1280px]", className)}>{children}</div>;
}
