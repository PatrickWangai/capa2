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
    <div className={cn("rounded-xl border border-line bg-surface p-5", emphasize && "border-ink", className)}>
      <p className="text-[11.5px] font-medium uppercase tracking-wide text-faint">{label}</p>
      <p className={cn("mt-1.5 font-tabular font-bold text-ink", emphasize ? "text-[26px]" : "text-[19px]")}>{value}</p>
      {sub && <div className="mt-1">{sub}</div>}
    </div>
  );
}
