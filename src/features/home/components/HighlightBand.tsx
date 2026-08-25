import Link from "next/link";

export interface HomeStats {
  openBookings: number;
  pendingRequests: number;
}

interface StatCardProps {
  value: number;
  label: string;
  href?: string;
  tone?: "neutral" | "primary";
}

function StatCard({ value, label, href, tone = "neutral" }: StatCardProps) {
  const content = (
    <div
      className={
        tone === "primary"
          ? "rounded-lg border border-primary-200 bg-primary-50 p-6 text-center transition-colors hover:bg-primary-100"
          : "rounded-lg border border-neutral-200 bg-white p-6 text-center shadow-[var(--shadow-elevation-1)]"
      }
    >
      <p
        className={tone === "primary" ? "text-3xl font-semibold text-primary-700" : "text-3xl font-semibold text-neutral-900"}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-neutral-500">{label}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function HighlightBand({ stats }: { stats: HomeStats | null }) {
  if (!stats || (stats.pendingRequests === 0 && stats.openBookings === 0)) {
    return null;
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap justify-center gap-4">
        {stats.pendingRequests > 0 && (
          <div className="w-full max-w-xs">
            <StatCard
              value={stats.pendingRequests}
              label={
                stats.pendingRequests === 1
                  ? "solicitação aguardando sua aprovação"
                  : "solicitações aguardando sua aprovação"
              }
              href="/reservas/recebidas"
              tone="primary"
            />
          </div>
        )}
        {stats.openBookings > 0 && (
          <div className="w-full max-w-xs">
            <StatCard
              value={stats.openBookings}
              label={stats.openBookings === 1 ? "reserva em andamento" : "reservas em andamento"}
              href="/reservas"
              tone={stats.pendingRequests === 0 ? "primary" : "neutral"}
            />
          </div>
        )}
      </div>
    </section>
  );
}
