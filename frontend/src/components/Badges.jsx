// One place for the Low/Medium/High and Pending/Validated/Corrected/Active/Resolved labels
// so every screen shows them the same way.
const RISK_STYLES = {
  Low: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  High: 'bg-red-50 text-red-700 ring-red-200',
}

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  Validated: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Corrected: 'bg-sky-50 text-sky-700 ring-sky-200',
  Active: 'bg-red-50 text-red-700 ring-red-200',
  Resolved: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const base = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset'

export function RiskBadge({ level }) {
  const dot = { Low: 'bg-emerald-500', Medium: 'bg-amber-500', High: 'bg-red-500' }[level]
  return (
    <span className={`${base} ${RISK_STYLES[level] || RISK_STYLES.Low}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot || 'bg-slate-400'}`} />
      {level} risk
    </span>
  )
}

export function StatusBadge({ status }) {
  return <span className={`${base} ${STATUS_STYLES[status] || STATUS_STYLES.Pending}`}>{status}</span>
}
