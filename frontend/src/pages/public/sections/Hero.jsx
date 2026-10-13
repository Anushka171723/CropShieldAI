import { Link } from 'react-router-dom'
import { ArrowRight, Info } from 'lucide-react'
import LeafAccent from '../../../components/landing/LeafAccent'
import SmartImage from '../../../components/landing/SmartImage'
import { useCta } from '../../../hooks/useCta'

// Staggered entrance: each block rises in once, 90ms apart. Only runs when motion is allowed.
const rise = (step) => ({ className: 'motion-safe:animate-rise', style: { animationDelay: `${step * 90}ms` } })

export default function Hero() {
  const cta = useCta()
  return (
    <section id="home" className="relative scroll-mt-16 overflow-hidden bg-linear-to-b from-[#f2f7ee] to-white">
      <LeafAccent className="absolute -left-16 bottom-0 hidden h-[70%] text-brand-700 opacity-[0.07] lg:block" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:px-8 lg:py-20">
        <div>
          <p style={rise(0).style} className={`${rise(0).className} text-sm font-semibold uppercase tracking-wider text-brand-700`}>
            Crop health, early warning and advice
          </p>
          <h1 style={rise(1).style} className={`${rise(1).className} mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-brand-900 sm:text-5xl`}>
            Detect Early. Protect Your Crops. Grow with Confidence.
          </h1>
          <p style={rise(2).style} className={`${rise(2).className} mt-5 max-w-xl text-lg leading-relaxed text-slate-700`}>
            Identify potential crop diseases and pests, understand local weather-related risks, and get actionable guidance with CropShield AI.
          </p>
          <div style={rise(3).style} className={`${rise(3).className} mt-8 flex flex-wrap gap-3`}>
            <Link to={cta.to} className="btn-primary group px-7 py-3.5">
              {cta.label} <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <a href="#features" className="btn-secondary px-7 py-3.5">
              Explore Features
            </a>
          </div>
          <p style={rise(4).style} className={`${rise(4).className} mt-6 flex max-w-lg items-start gap-2 text-sm text-slate-600`}>
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
            Results are AI predictions, not final diagnoses. An agricultural expert can review and confirm them.
          </p>
        </div>

        {/* Fades in, then drifts a few percent larger over 30s (once, not looping). */}
        <div className="motion-safe:animate-fade" style={{ animationDelay: '150ms' }}>
          <SmartImage
            src="/images/hero-farmer-wheat.jpg"
            alt="A farmer walking through a green wheat field and checking the crop"
            priority
            position="60% center"
            imgClassName="motion-safe:animate-slow-zoom"
            className="aspect-[4/3] rounded-xl border border-slate-200 shadow-sm lg:aspect-[5/4]"
          />
        </div>
      </div>
    </section>
  )
}


