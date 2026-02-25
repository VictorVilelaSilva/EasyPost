'use client';

import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import { useParallax } from '../../hooks/useParallax';
import { scaleUpVariants } from './animations';
import styles from '../LandingPage.module.css';

export function AIDemoMockup() {
    const mockupRef = useRef<HTMLElement>(null);
    const mockupY = useParallax(mockupRef, [40, -40]);

    return (
        <motion.section
            ref={mockupRef}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleUpVariants}
            className="px-6 md:px-12 pb-24"
        >
            <motion.div
                style={{ y: mockupY }}
                className={`max-w-5xl mx-auto p-6 md:p-10 ${styles.glassPanel}`}
            >
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left sidebar — settings */}
                    <div className="md:w-64 shrink-0 space-y-6">
                        <p
                            className="text-xs font-semibold tracking-[0.15em] uppercase"
                            style={{ color: 'var(--lp-dim)' }}
                        >
                            Configurações de Geração
                        </p>

                        {/* Dropdowns */}
                        <div className="space-y-3">
                            <div
                                className="flex items-center justify-between px-4 py-3 rounded-lg text-sm"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--lp-border)',
                                    color: 'var(--lp-muted)',
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                <span>Estilo: Cinemático</span>
                                <ChevronDown size={16} />
                            </div>
                            <div
                                className="flex items-center justify-between px-4 py-3 rounded-lg text-sm"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--lp-border)',
                                    color: 'var(--lp-muted)',
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                <span>Tom: Ousado & Viral</span>
                                <ChevronDown size={16} />
                            </div>
                        </div>

                        {/* Brand Identity */}
                        <div>
                            <p
                                className="text-xs font-semibold tracking-[0.15em] uppercase mb-3"
                                style={{ color: 'var(--lp-dim)' }}
                            >
                                Identidade Visual
                            </p>
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full" style={{ background: 'var(--lp-accent)' }} />
                                <div className="w-8 h-8 rounded-full" style={{ background: '#585858' }} />
                                <div className="w-8 h-8 rounded-full" style={{ background: '#7e7e7e' }} />
                            </div>
                        </div>
                    </div>

                    {/* Right — preview area */}
                    <div className="flex-1 relative">
                        {/* Smart Layout badge */}
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="absolute top-4 right-4 z-10"
                        >
                            <span className={`${styles.badge} text-[0.65rem]!`}>Smart Layout</span>
                        </motion.div>

                        {/* Image preview */}
                        <div
                            className="relative rounded-xl overflow-hidden flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(145deg, rgba(124,58,237,0.06) 0%, rgba(120,60,180,0.15) 50%, rgba(30,20,40,0.3) 100%)',
                                minHeight: '280px',
                                border: '1px solid var(--lp-border)',
                            }}
                        >
                            {/* AI active overlay */}
                            <div className="text-center z-10">
                                <motion.div
                                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                    className="flex items-center justify-center mb-3"
                                >
                                    <Sparkles size={32} style={{ color: 'var(--lp-accent)' }} />
                                </motion.div>
                                <p
                                    className="font-bold text-lg"
                                    style={{ color: 'var(--lp-accent)', fontFamily: 'var(--font-display)' }}
                                >
                                    IA Gerando
                                </p>
                                <p
                                    className="text-sm italic mt-1"
                                    style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}
                                >
                                    Otimizando layout para Instagram...
                                </p>
                            </div>
                        </div>

                        {/* Color Correction badge */}
                        <div className="flex justify-center mt-4">
                            <span
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase"
                                style={{
                                    border: '1px solid var(--lp-border)',
                                    color: 'var(--lp-muted)',
                                    fontFamily: 'var(--font-body)',
                                }}
                            >
                                Correção de Cor
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.section>
    );
}
