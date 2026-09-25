import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  emphasize = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  emphasize?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border-2 border-line-strong bg-surface p-5 shadow-hard-sm", emphasize && "shadow-hard border-primary", className)}>
      <p className="text-[11.5px] font-bold uppercase tracking-wide text-faint">{label}</p>
      <p className={cn("mt-1.5 font-tabular font-extrabold text-ink", emphasize ? "text-[26px]" : "text-[19px]")}>{value}</p>
      {sub && <div className="mt-1">{sub}</div>}
    </div>
  );
}
