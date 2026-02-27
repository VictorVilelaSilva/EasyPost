'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/create');
        }
    }, [user, loading, router]);

    // Opcional: não renderizar o LP enquanto verifica o auth, para evitar flick de tela
    if (loading || user) {
        return <div className="min-h-screen" style={{ background: 'var(--color-surface)' }} />; // placeholder blank
    }

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
