'use client';

import { motion } from 'framer-motion';
import { Sparkles, Type, Maximize2 } from 'lucide-react';
import { staggerContainer, fadeUpVariants } from './animations';
import styles from '../LandingPage.module.css';

export function FeaturesGrid() {
    return (
        <section className="py-24 md:py-32 px-6">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="max-w-5xl mx-auto"
            >
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        variants={fadeUpVariants}
                        className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        Ferramentas Mágicas para Criadores
                    </motion.h2>
                    <motion.p
                        variants={fadeUpVariants}
                        className="text-base max-w-xl mx-auto"
                        style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}
                    >
                        Tecnologia sofisticada por trás de uma interface simples e intuitiva.
                    </motion.p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 — Magic Design */}
                    <motion.div variants={fadeUpVariants} className={styles.featureCard}>
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                            style={{ background: 'var(--lp-accent-muted)' }}
                        >
                            <Sparkles size={22} style={{ color: 'var(--lp-accent)' }} />
                        </div>
                        <h3
                            className="text-lg font-bold mb-2"
                            style={{ fontFamily: 'var(--font-display)' }}
                        >
                            Design Mágico
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}>
                            Gere layouts impressionantes que se adaptam ao tom emocional do seu conteúdo e identidade visual.
                        </p>
                    </motion.div>

                    {/* Card 2 — Smart Copywriting */}
                    <motion.div variants={fadeUpVariants} className={styles.featureCard}>
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--lp-border)' }}
                        >
                            <Type size={22} style={{ color: 'var(--lp-muted)' }} />
                        </div>
                        <h3
                            className="text-lg font-bold mb-2"
                            style={{ fontFamily: 'var(--font-display)' }}
                        >
                            Copywriting Inteligente
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}>
                            Legendas e títulos otimizados pela IA para conversão em cada plataforma social.
                        </p>
                    </motion.div>

                    {/* Card 3 — Instant Resize */}
                    <motion.div variants={fadeUpVariants} className={styles.featureCard}>
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                            style={{ background: 'var(--lp-accent-muted)' }}
                        >
                            <Maximize2 size={22} style={{ color: 'var(--lp-accent)' }} />
                        </div>
                        <h3
                            className="text-lg font-bold mb-2"
                            style={{ fontFamily: 'var(--font-display)' }}
                        >
                            Redimensionamento Instantâneo
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}>
                            Um clique para transformar seu post em Stories, banners do LinkedIn ou threads do Twitter.
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
}
