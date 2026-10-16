import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { RiskBadge, StatusBadge } from '../Badges'
import { formatDate } from '../../utils/format'

// One row in the "My Reports" list: thumbnail, crop + issue, risk/status badges, submission date.
export default function ReportCard({ report }) {
  return (
    <Link
      to={`/farmer/reports/${report.id}`}
      className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3.5 transition hover:border-brand-400 hover:bg-brand-50/40"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
        {report.imageUrl ? (
          <img src={report.imageUrl} alt={`${report.crop} photo`} className="h-full w-full object-cover" />
        ) : (
          <Leaf className="h-6 w-6 text-slate-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate font-semibold text-slate-900">{report.crop}</p>
          <span className="shrink-0 text-xs text-slate-400">{report.id}</span>
        </div>
        <p className="truncate text-sm text-slate-600">{report.issue}</p>
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
        <RiskBadge level={report.riskLevel} />
        <StatusBadge status={report.reviewStatus} />
      </div>

      <p className="hidden w-24 shrink-0 text-right text-xs text-slate-500 md:block">{formatDate(report.submittedAt)}</p>
    </Link>
  )
}
