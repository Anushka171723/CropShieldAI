import { useEffect, useRef, useState } from 'react'
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react'
import { IMAGE_RULES } from '../utils/cropOptions'

// Controlled by the parent: `file` is the chosen File (or null); `onChange(file)` is called with a valid file or null.
export default function ImageUploader({ file, onChange, error, onError, disabled }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const accept = (picked) => {
    if (!picked) return
    if (!IMAGE_RULES.types.includes(picked.type)) {
      onError('Please upload a JPG, PNG or WebP image.')
      return
    }
    if (picked.size > IMAGE_RULES.maxBytes) {
      onError(`Image is too large (${(picked.size / 1048576).toFixed(1)} MB). Maximum size is 5 MB.`)
      return
    }
    onError('')
    onChange(picked)
  }

  const remove = () => {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_RULES.types.join(',')}
        capture="environment"
        className="sr-only"
        id="crop-image"
        disabled={disabled}
        onChange={(e) => accept(e.target.files?.[0])}
      />

      {preview ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-surface">
          <img src={preview} alt="Selected crop" className="max-h-80 w-full bg-slate-100 object-contain" />
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5 text-sm">
            <span className="min-w-0 truncate text-slate-600">
              {file.name} · {(file.size / 1048576).toFixed(2)} MB
            </span>
            <div className="flex shrink-0 gap-1">
              <label htmlFor="crop-image" className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100">
                <RefreshCw className="h-4 w-4" /> Change
              </label>
              <button type="button" onClick={remove} disabled={disabled} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-medium text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor="crop-image"
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            if (!disabled) accept(e.dataTransfer.files?.[0])
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-10 text-center transition ${
            dragging ? 'border-brand-500 bg-brand-50' : error ? 'border-red-300 bg-red-50/40' : 'border-slate-300 bg-surface hover:border-brand-400 hover:bg-brand-50/40'
          }`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <ImagePlus className="h-6 w-6" />
          </span>
          <span className="font-medium text-slate-900">Take a photo or upload from gallery</span>
          <span className="text-sm text-slate-500">Drag and drop, or tap to browse. JPG, PNG or WebP, up to 5 MB.</span>
        </label>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
