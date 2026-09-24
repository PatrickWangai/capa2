import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium leading-none",
  {
    variants: {
      variant: {
        neutral: "bg-surface-raised text-ink-soft border border-line",
        gain: "bg-gain-tint text-gain",
        loss: "bg-loss-tint text-loss",
        signal: "bg-signal-tint text-signal",
        outline: "border border-line-strong text-ink-soft",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
