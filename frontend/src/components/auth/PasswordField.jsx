import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import TextField from '../TextField'

// Password input with a show/hide toggle. Pass `visible`/`onToggle` to share one toggle across two fields.
export default function PasswordField({ visible, onToggle, ...props }) {
  const [localVisible, setLocalVisible] = useState(false)
  const shown = visible ?? localVisible
  const toggle = onToggle ?? (() => setLocalVisible((v) => !v))

  return (
    <TextField
      icon={Lock}
      type={shown ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={toggle}
          aria-label={shown ? 'Hide password' : 'Show password'}
          aria-pressed={shown}
          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          {shown ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      }
      {...props}
    />
  )
}
