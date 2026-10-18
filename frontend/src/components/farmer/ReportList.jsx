import { Leaf } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '../StateViews'
import ReportCard from './ReportCard'

// Shared list body for any screen that shows a set of reports: handles the loading/empty/error states
// so pages only need to decide what reports to pass in.
export default function ReportList({ reports, loading, error, onRetry, emptyTitle = 'No reports found', emptyText = 'Try a different search or filter.' }) {
  if (loading) return <LoadingState label="Loading reports..." />
  if (error) return <ErrorState message={error} onRetry={onRetry} />
  if (reports.length === 0) return <EmptyState icon={Leaf} title={emptyTitle} text={emptyText} />

  return (
    <div className="space-y-2.5">
      {reports.map((r) => (
        <ReportCard key={r.id} report={r} />
      ))}
    </div>
  )
}
