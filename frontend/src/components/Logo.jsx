import { Leaf, ShieldCheck } from 'lucide-react'

export default function Logo({ light = false, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${
          light ? 'bg-white/15 text-white ring-1 ring-white/30' : 'bg-brand-800 text-white'
        }`}
      >
        <ShieldCheck className="h-7 w-7" strokeWidth={1.6} />
        <Leaf className="absolute h-3.5 w-3.5" strokeWidth={2.2} />
      </span>
      <span className={`text-xl font-bold tracking-tight ${light ? 'text-white' : 'text-brand-900'}`}>
        CropShield<span className={light ? 'font-medium text-brand-200' : 'font-medium text-brand-700'}> AI</span>
      </span>
    </div>
  )
}
