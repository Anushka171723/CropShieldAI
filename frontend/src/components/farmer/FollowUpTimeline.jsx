import { CheckCircle2, Circle, MinusCircle, XCircle } from 'lucide-react'
import { formatDate } from '../../utils/format'

const OUTCOME_ICON = { Improved: CheckCircle2, Unchanged: MinusCircle, Worsened: XCircle }
const OUTCOME_COLOR = { Improved: 'text-emerald-600', Unchanged: 'text-amber-600', Worsened: 'text-red-600' }

// Chronological list of updates recorded against one follow-up. Shared between Report Details and the
// Follow-up Details screen so both show the same visual history.
export default function FollowUpTimeline({ updates }) {
  if (!updates || updates.length === 0) {
    return <p className="text-sm text-slate-500">No updates recorded yet.</p>
  }

  return (
    <ol className="space-y-4">
      {[...updates].reverse().map((u, i) => {
        const Icon = OUTCOME_ICON[u.outcome] || Circle
        return (
          <li key={i} className="flex gap-3">
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${OUTCOME_COLOR[u.outcome] || 'text-slate-400'}`} />
            <div className="min-w-0 flex-1 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{u.outcome}</p>
                <p className="text-xs text-slate-400">{formatDate(u.at)}</p>
              </div>
              {u.note && <p className="mt-1 text-sm text-slate-600">{u.note}</p>}
              {u.imageUrl && <img src={u.imageUrl} alt="Follow-up photo" className="mt-2 h-24 w-24 rounded-lg object-cover" />}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
