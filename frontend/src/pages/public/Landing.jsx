import FinalCta from '../../components/landing/FinalCta'
import LandingFooter from '../../components/landing/LandingFooter'
import LandingHeader from '../../components/landing/LandingHeader'
import AboutSection from './sections/AboutSection'
import FeaturesSection from './sections/FeaturesSection'
import Hero from './sections/Hero'
import HowItWorksSection from './sections/HowItWorksSection'
import RolesSection from './sections/RolesSection'
import WhySection from './sections/WhySection'

export default function Landing() {
  return (
    <div className="bg-surface">
      <LandingHeader />
      <main>
        <Hero />
        <WhySection />
        <FeaturesSection />
        <HowItWorksSection />
        <RolesSection />
        <AboutSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  )
}

