import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn("font-sans text-[19px] font-bold tracking-tight text-ink lowercase select-none", className)}
    >
      capa
    </span>
  );
}
