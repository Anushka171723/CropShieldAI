import { useState } from 'react'
import { Leaf } from 'lucide-react'

// Photo with a calm fallback: if the file is missing or fails to load, a tinted block is shown
// instead of a broken-image icon. Size it with className (e.g. aspect ratio + width).
export default function SmartImage({ src, alt, className = '', imgClassName = '', priority = false, position = 'center' }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`relative overflow-hidden bg-brand-100 ${className}`}>
      {failed ? (
        <div role="img" aria-label={alt} className="flex h-full w-full items-center justify-center text-brand-700/60">
          <Leaf className="h-10 w-10" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          decoding="async"
          onError={() => setFailed(true)}
          style={{ objectPosition: position }}
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      )}
    </div>
  )
}
