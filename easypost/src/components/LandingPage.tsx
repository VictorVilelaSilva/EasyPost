'use client';

import dynamic from 'next/dynamic';
import styles from './LandingPage.module.css';

// Critical UI (Above the fold) - normal imports
import { Navbar } from './landing/Navbar';
import { Hero } from './landing/Hero';

// Deferred components (Below the fold) - dynamic imports
const AIDemoMockup = dynamic(() => import('./landing/AIDemoMockup').then(m => m.AIDemoMockup));
const LogosBar = dynamic(() => import('./landing/LogosBar').then(m => m.LogosBar));
const FeaturesGrid = dynamic(() => import('./landing/FeaturesGrid').then(m => m.FeaturesGrid));
const ProcessSteps = dynamic(() => import('./landing/ProcessSteps').then(m => m.ProcessSteps));
const FinalCTA = dynamic(() => import('./landing/FinalCTA').then(m => m.FinalCTA));
const Footer = dynamic(() => import('./landing/Footer').then(m => m.Footer));

export default function LandingPage() {
    return (
        <div className={`${styles.root} lp-active`}>
            <Navbar />
            <Hero />
            <AIDemoMockup />
            <LogosBar />
            <FeaturesGrid />
            <ProcessSteps />
            <FinalCTA />
            <Footer />
        </div>
    );
}
