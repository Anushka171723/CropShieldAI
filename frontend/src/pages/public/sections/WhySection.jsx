import Reveal from '../../../components/landing/Reveal'
import SectionHeading from '../../../components/landing/SectionHeading'
import SmartImage from '../../../components/landing/SmartImage'
import { WHY_POINTS } from '../landingContent'

export default function WhySection() {
  return (
    <section id="why" aria-labelledby="why-heading" className="scroll-mt-16 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8 lg:py-24">
        <Reveal>
          <SmartImage
            src="/images/farmer-inspecting-crop.jpg"
            alt="A farmer crouching in a field to inspect the crop closely"
            position="center 35%"
            className="aspect-[4/5] max-h-[560px] w-full rounded-xl border border-slate-200 lg:aspect-auto lg:h-full"
          />
        </Reveal>

        <Reveal delay={120}>
          <SectionHeading id="why-heading" eyebrow="Why CropShield AI?" title="Crop problems are easier to handle when they are caught early.">
            Farmers often have to decide with limited information. CropShield AI brings the pieces together in one place.
          </SectionHeading>

          <dl className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {WHY_POINTS.map(({ title, text }) => (
              <div key={title} className="grid gap-1 py-4 transition-colors duration-200 hover:bg-section sm:grid-cols-[14rem_1fr] sm:gap-6 sm:px-3 sm:-mx-3">
                <dt className="font-semibold text-brand-900">{title}</dt>
                <dd className="text-slate-600">{text}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-6 max-w-2xl leading-relaxed text-slate-700">
            CropShield AI combines photo-based detection, weather-aware risk, local hotspot information, expert review and multilingual guidance, so a single report leads to a clear next step instead of a guess.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
