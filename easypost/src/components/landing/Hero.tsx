'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import { useParallax } from '../../hooks/useParallax';
import { staggerContainer, fadeUpVariants } from './animations';
import styles from '../LandingPage.module.css';

export function Hero() {
    const heroRef = useRef<HTMLElement>(null);
    const heroY = useParallax(heroRef, [0, 150], ['start start', 'end start']);
    const heroOpacity = useParallax(heroRef, [1, 0], ['start start', 'end start']);

    return (
        <section ref={heroRef} className={`relative overflow-hidden py-24 md:py-36 px-6 text-center ${styles.glowBg}`}>
            <motion.div
                initial="hidden"
                animate="visible"
                style={{ y: heroY, opacity: heroOpacity }}
                variants={staggerContainer}
                className="relative z-10 max-w-4xl mx-auto"
            >
                {/* Badge */}
                <motion.div variants={fadeUpVariants} className={`${styles.badge} mx-auto mb-8`}>
                    Experimente a Magia da IA
                </motion.div>

                {/* Headline */}
                <motion.h1
                    variants={fadeUpVariants}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] mb-6"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    Transforme Ideias em{' '}
                    <span
                        className="italic"
                        style={{ color: 'var(--lp-accent)' }}
                    >
                        Conteúdo Viral
                    </span>{' '}
                    Instantaneamente
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={fadeUpVariants}
                    className="text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
                    style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}
                >
                    O motor de IA completo que transforma seus pensamentos em ativos profissionais
                    para redes sociais. Sem habilidades, sem fricção, apenas pura magia.
                </motion.p>

                {/* CTAs */}
                <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href="#"
                        className={`${styles.btnPrimary} text-base px-8`}
                    >
                        Criar Meu Primeiro Post
                    </motion.a>
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href="#"
                        className={`${styles.btnSecondary} text-base px-8`}
                    >
                        Ver Galeria
                    </motion.a>
                </motion.div>
            </motion.div>

            {/* Subtle scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-20 flex justify-center animate-bounce"
                style={{ color: 'var(--lp-subtle)' }}
            >
                <ChevronDown size={24} />
            </motion.div>
        </section>
    );
}
