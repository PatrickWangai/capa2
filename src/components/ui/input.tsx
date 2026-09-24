import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-line-strong bg-surface px-3.5 text-[14px] text-ink placeholder:text-faint transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ink disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label ref={ref} className={cn("text-[13px] font-medium text-ink-soft", className)} {...props} />
  ),
);
Label.displayName = "Label";

export const FieldError = ({ children }: { children?: React.ReactNode }) => {
  if (!children) return null;
  return <p className="mt-1 text-[12.5px] text-loss">{children}</p>;
};
