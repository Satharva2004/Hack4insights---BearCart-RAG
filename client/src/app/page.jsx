'use client'

import HeroSection from "@/components/sections/HeroSection"
import AboutSection from "@/components/sections/AboutSection"
import FeaturesSection from "@/components/sections/FeaturesSection"
import DemoSection from "@/components/sections/DemoSection"
import TrackingSection from "@/components/sections/TrackingSection"
import ArenaChatSection from "@/components/sections/ArenaChatSection"
import CTASection from "@/components/sections/CTASection"
import Footer from "@/components/sections/Footer"
import Navbar from "@/components/Navbar"

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Navbar />
        <main>
          <HeroSection />
          <AboutSection />
          <FeaturesSection />
          <DemoSection />
          <TrackingSection />
          
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  )
}