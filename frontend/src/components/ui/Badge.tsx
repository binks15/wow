import type { HTMLAttributes } from "react";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "success" | "warning" | "info";
};

export const Badge = ({
  tone = "neutral",
  className,
  ...props
}: BadgeProps) => (
  <span
    className={`'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold'
         ${tone === "neutral" && "border-slate-200 bg-(--color-bg) text-(--color-dark)"} 
         ${tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700"} 
         ${tone === "warning" && "border-amber-200 bg-amber-50 text-amber-700"} 
         ${tone === "info" && "border-blue-200 bg-blue-50 text-blue-700"} 
         ${className}`}
    {...props}
  />
);