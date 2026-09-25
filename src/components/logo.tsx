import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[19px] font-extrabold uppercase tracking-tight text-ink select-none",
        className,
      )}
      style={{ fontFamily: "var(--font-display)" }}
    >
      <span className="inline-block size-2.5 rounded-[2px] bg-primary" />
      capa
    </span>
  );
}
