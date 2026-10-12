import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn("w-full rounded-lg border border-white/10 bg-background px-3 py-2.5 text-sm text-text-primary outline-none focus:border-primary disabled:opacity-50", className)} {...props} />;
});
