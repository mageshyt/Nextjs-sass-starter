

import React from 'react'
import HeroSection from './components/hero-section'
import TechStack from './components/tech-stack-section'
import FeatureSection from './components/feature-section'


const MarketkingPage = () => {
  return (
    <div className='space-y-6'>
      <HeroSection />
      <TechStack />
      <FeatureSection />
    </div>
  )
}

export default MarketkingPage
