import Reveal from '../../../components/landing/Reveal'

export default function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-heading" className="scroll-mt-16 bg-linear-to-b from-surface to-hero">
      <Reveal className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">About CropShield AI</p>
        <h2 id="about-heading" className="mt-2 text-3xl font-bold leading-snug tracking-tight text-brand-900 sm:text-4xl">
          Early detection and accessible crop-health information, so farming decisions can be better informed.
        </h2>
        <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-700">
          <p>
            CropShield AI is an early-warning platform for crop diseases and pest infestations. It brings together image-based screening, weather-driven risk, local hotspot information, expert validation and multilingual advice, with follow-up monitoring for every case.
          </p>
          <p>
            Our aim is simple: make crop-health information early, understandable and within reach of the farmers, experts and officers who act on it.
          </p>
        </div>
      </Reveal>
    </section>
  )
}
