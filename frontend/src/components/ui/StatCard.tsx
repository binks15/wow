type StatCardProps = {
  label: string
  value: string
  message?: string
}

export const StatCard = ({ label, value, message }: StatCardProps) => (
  <div className="rounded-2xl border border-slate-200 bg-(--color-text) p-5 text-(--color-dark) shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-(--color-dark)">{value}</p>
    {message ? <p className="mt-1 text-xs text-slate-600">{message}</p> : null}
  </div>
)