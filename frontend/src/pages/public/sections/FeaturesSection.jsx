import { BellRing, Bug, CloudSun, Languages, Landmark, MapPin, Microscope, ScanSearch } from 'lucide-react'
import Reveal from '../../../components/landing/Reveal'
import SectionHeading from '../../../components/landing/SectionHeading'

// Three different treatments on purpose: ruled columns, two large panels, then a ruled list.
const DETECT = [
  { icon: ScanSearch, title: 'AI Disease Detection', text: 'Analyse uploaded crop images to identify possible diseases, with a confidence level you can see.' },
  { icon: Bug, title: 'Pest Detection', text: 'Detect potential pest infestations from crop images and see where on the leaf they were found.' },
  { icon: CloudSun, title: 'Weather-Based Risk Assessment', text: 'Estimate crop-health risk as Low, Medium or High using weather, crop stage and variety.' },
]

const COMMUNITY = [
  { icon: MapPin, title: 'Geospatial Hotspot Monitoring', text: 'Explore reported disease and pest activity on a map. Clusters of similar reports from nearby farms show up as hotspots, so you can see what is developing around you.' },
  { icon: Microscope, title: 'Expert Validation', text: 'Agricultural experts review the photo, details and AI prediction. They can confirm it, reject it or correct it, and the result is clearly marked as AI-predicted, validated or corrected.' },
]

const FOLLOW = [
  { icon: Languages, title: 'Personalised Multilingual Advisory', text: 'Understandable guidance and preventive measures in English, Hindi and Marathi.' },
  { icon: BellRing, title: 'Follow-up Monitoring', text: 'Track case progress, interventions and later crop-health updates until the case is resolved.' },
  { icon: Landmark, title: 'Officer Dashboard', text: 'Helps authorised officers monitor regional cases, hotspots and interventions.' },
]

export default function FeaturesSection() {
  return (
    <section id="features" aria-labelledby="features-heading" className="scroll-mt-16 bg-[#f6f9f3]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <SectionHeading id="features-heading" eyebrow="Features" title="Everything from the first photo to the final follow-up.">
            One workflow connects detection, risk, local activity, expert review and advice.
          </SectionHeading>
        </Reveal>

        {/* 1. Ruled columns: the rule and icon warm up on hover */}
        <div className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3">
          {DETECT.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 90}>
              <div className="group h-full border-t-2 border-brand-800 pt-5 transition-colors duration-200 hover:border-brand-500">
                <Icon className="h-7 w-7 text-brand-700 transition-colors duration-200 group-hover:text-brand-500" strokeWidth={1.6} />
                <h3 className="mt-4 text-lg font-semibold text-brand-900">{title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* 2. Two larger panels: a slight lift on hover */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {COMMUNITY.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div
                className={`h-full rounded-xl p-7 transition-[transform,box-shadow,border-color] duration-300 sm:p-8 motion-safe:hover:-translate-y-0.5 hover:shadow-lg ${
                  i === 0 ? 'bg-brand-900 text-white hover:shadow-brand-900/25' : 'border border-slate-200 bg-white hover:border-brand-300 hover:shadow-slate-300/50'
                }`}
              >
                <Icon className={`h-8 w-8 ${i === 0 ? 'text-brand-300' : 'text-brand-700'}`} strokeWidth={1.5} />
                <h3 className={`mt-5 text-xl font-semibold ${i === 0 ? 'text-white' : 'text-brand-900'}`}>{title}</h3>
                <p className={`mt-3 leading-relaxed ${i === 0 ? 'text-brand-100/90' : 'text-slate-600'}`}>{text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* 3. Ruled list: row tints on hover */}
        <Reveal as="ul" className="mt-14 divide-y divide-slate-300 border-y border-slate-300">
          {FOLLOW.map(({ icon: Icon, title, text }) => (
            <li key={title} className="group grid items-start gap-3 py-6 transition-colors duration-200 hover:bg-white/70 sm:grid-cols-[2.5rem_16rem_1fr] sm:gap-6 sm:px-3">
              <Icon className="h-6 w-6 text-brand-700 transition-colors duration-200 group-hover:text-brand-500" strokeWidth={1.7} />
              <h3 className="font-semibold text-brand-900">{title}</h3>
              <p className="text-slate-600">{text}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
