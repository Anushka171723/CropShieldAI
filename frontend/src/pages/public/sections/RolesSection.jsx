import Reveal from '../../../components/landing/Reveal'
import SectionHeading from '../../../components/landing/SectionHeading'
import SmartImage from '../../../components/landing/SmartImage'
import { ROLES } from '../landingContent'

export default function RolesSection() {
  return (
    <section id="who-can-use" aria-labelledby="roles-heading" className="scroll-mt-16 bg-section">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <Reveal>
          <SectionHeading id="roles-heading" eyebrow="Who can use CropShield AI?" title="Built for the people who work together on crop health." />
          <dl className="mt-8 divide-y divide-slate-300 border-y border-slate-300">
            {ROLES.map(({ title, text }) => (
              <div key={title} className="py-5">
                <dt className="font-semibold text-brand-900">{title}</dt>
                <dd className="mt-1.5 leading-relaxed text-slate-600">{text}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={120}>
          <SmartImage
            src="/images/farmer-and-advisor.jpg"
            alt="Two people kneeling in a field, examining a handful of soil and plants together"
            position="center 40%"
            className="aspect-[4/3] rounded-xl border border-slate-200"
          />
        </Reveal>
      </div>
    </section>
  )
}
