import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const TONES = {
  error: { box: 'border-red-200 bg-red-50 text-red-700', icon: AlertCircle, role: 'alert' },
  success: { box: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: CheckCircle2, role: 'status' },
  info: { box: 'border-amber-200 bg-amber-50 text-amber-900', icon: Info, role: 'status' },
}

export default function FormAlert({ tone = 'error', title, children }) {
  const { box, icon: Icon, role } = TONES[tone]
  return (
    <div role={role} className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${box}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        <p>{children}</p>
      </div>
    </div>
  )
}
