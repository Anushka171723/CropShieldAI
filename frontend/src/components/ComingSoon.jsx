import { Hammer } from 'lucide-react'
import PageContainer from './PageContainer'

// Placeholder rendered inside the app layout for screens that are not built yet.
export default function ComingSoon({ title, description }) {
  return (
    <PageContainer className="flex flex-col items-center gap-3 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <Hammer className="h-6 w-6" />
      </span>
      <h1 className="text-xl font-bold text-brand-900">{title}</h1>
      <p className="max-w-md text-sm text-slate-600">{description || 'This screen has not been built yet.'}</p>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Coming soon</span>
    </PageContainer>
  )
}
