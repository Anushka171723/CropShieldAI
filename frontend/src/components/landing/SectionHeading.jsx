export default function SectionHeading({ eyebrow, title, id, children, className = '' }) {
  return (
    <div className={className}>
      {eyebrow && <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">{eyebrow}</p>}
      <h2 id={id} className="mt-2 text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">{title}</h2>
      {children && <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">{children}</p>}
    </div>
  )
}

