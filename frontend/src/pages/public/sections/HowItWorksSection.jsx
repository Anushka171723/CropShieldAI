import { ShieldAlert } from 'lucide-react'
import Reveal from '../../../components/landing/Reveal'
import SectionHeading from '../../../components/landing/SectionHeading'
import { useInView } from '../../../hooks/useInView'
import { STEPS } from '../landingContent'

export default function HowItWorksSection() {
  const [ref, inView] = useInView({ threshold: 0.2 })

  // The connecting line draws first, then each step appears 180ms after the last.
  const lineBase = 'absolute bg-brand-200 motion-safe:transition-transform motion-safe:duration-[1100ms] motion-safe:ease-out'

  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <SectionHeading id="how-heading" eyebrow="How It Works" title="Four steps from a photo to a plan." />
        </Reveal>

        {/* Vertical on small screens, horizontal with a connecting line from lg */}
        <ol ref={ref} className="relative mt-12 grid gap-8 lg:grid-cols-4 lg:gap-6">
          <span aria-hidden="true" className={`${lineBase} left-5 top-5 hidden h-px w-[calc(100%-2.5rem)] origin-left lg:block ${inView ? '' : 'motion-safe:scale-x-0'}`} />
          <span aria-hidden="true" className={`${lineBase} bottom-5 left-5 top-5 w-px origin-top lg:hidden ${inView ? '' : 'motion-safe:scale-y-0'}`} />
          {STEPS.map(({ title, text }, i) => (
            <li
              key={title}
              style={{ transitionDelay: `${300 + i * 180}ms` }}
              className={`group relative flex gap-5 motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out lg:block ${
                inView ? '' : 'motion-safe:translate-y-4 motion-safe:opacity-0'
              }`}
            >
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-white ring-4 ring-white transition-colors duration-200 group-hover:bg-brand-600">
                {i + 1}
              </span>
              <div className="lg:mt-5">
                <h3 className="font-semibold text-brand-900">{title}</h3>
                <p className="mt-1.5 leading-relaxed text-slate-600">{text}</p>
              </div>
            </li>
          ))}
        </ol>

        <Reveal delay={200} className="mt-12">
          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              <strong className="font-semibold">AI results are predictions, not guaranteed diagnoses.</strong> Image quality, crop stage and local conditions all affect them, so some cases may need an agricultural expert to validate or correct the result.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
