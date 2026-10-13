import { useState } from 'react'
import { useInView } from '../../hooks/useInView'

// Fades and lifts a block in when it scrolls into view. `delay` (ms) staggers siblings.
// All hiding/transition classes are `motion-safe:`, so with reduced motion the content is just visible.
// Put hover effects on a child, not on this wrapper: its transition-delay is cleared once the reveal ends.
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const [ref, inView] = useInView()
  const [settled, setSettled] = useState(false)

  return (
    <Tag
      ref={ref}
      style={delay && !settled ? { transitionDelay: `${delay}ms` } : undefined}
      onTransitionEnd={(e) => e.target === e.currentTarget && setSettled(true)}
      className={`motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out ${
        inView ? '' : 'motion-safe:translate-y-5 motion-safe:opacity-0'
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
