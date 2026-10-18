import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import LeafAccent from './LeafAccent'
import { useCta } from '../../hooks/useCta'
import Reveal from './Reveal'

export default function FinalCta() {
  const cta = useCta()
  return (
    <section aria-labelledby="cta-heading" className="keep-brand-light relative overflow-hidden bg-brand-900">
      <LeafAccent className="absolute -right-10 top-1/2 hidden h-[140%] -translate-y-1/2 text-white opacity-[0.06] md:block" />
      <Reveal className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Take the First Step Toward Healthier Crops.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-brand-100/90">Create a free account and submit your first crop report in a few minutes.</p>
        <Link to={cta.to} className="btn-light group mt-8 px-7 py-3.5">
          {cta.label} <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </Reveal>
    </section>
  )
}

