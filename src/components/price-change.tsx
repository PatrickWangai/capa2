import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function PriceChange({
  percent,
  amount,
  currency,
  size = "md",
  className,
}: {
  percent: number;
  amount?: number;
  currency?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const isFlat = Math.abs(percent) < 0.005;
  const isUp = percent > 0;
  const color = isFlat ? "text-muted" : isUp ? "text-gain" : "text-loss";
  const Icon = isFlat ? Minus : isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-tabular font-medium",
        color,
        size === "sm" ? "text-[12px]" : "text-[13.5px]",
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-3.5"} strokeWidth={2.5} />
      {amount !== undefined && (
        <span>
          {currency ?? ""} {Math.abs(amount).toLocaleString("en-US", { maximumFractionDigits: 2 })}
        </span>
      )}
      <span>({isUp && !isFlat ? "+" : ""}{percent.toFixed(2)}%)</span>
    </span>
  );
}
