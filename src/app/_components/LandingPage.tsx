'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import HeroSection from './landing/HeroSection';
import ShowcaseGallery from './landing/ShowcaseGallery';
import HowItWorks from './landing/HowItWorks';
import FeatureHighlights from './landing/FeatureHighlights';
import FinalCTA from './landing/FinalCTA';
import Footer from './landing/Footer';

export default function LandingPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/create');
        }
    }, [user, loading, router]);

    if (loading || user) {
        return <div className="min-h-screen bg-black" />;
    }

    return (
        <div className="bg-[#0a0a0a] text-slate-200 selection:bg-purple/30 min-h-screen relative overflow-hidden">
            {/* Material Symbols for feature icons */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
            `}</style>

            {/* Ambient background glow */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        radial-gradient(at 0% 0%, color-mix(in srgb, var(--color-purple) 6%, transparent) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, color-mix(in srgb, var(--color-purple-deep) 6%, transparent) 0px, transparent 50%)
                    `,
                }}
            />

            <main className="relative z-10">
                <HeroSection />
                <ShowcaseGallery />
                <HowItWorks />
                <FeatureHighlights />
                <FinalCTA />
                <Footer />
            </main>
        </div>
    );
}
