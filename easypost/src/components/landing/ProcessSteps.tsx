'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useRef } from 'react';
import { useParallax } from '../../hooks/useParallax';
import { staggerContainer, fadeUpVariants, scaleUpVariants } from './animations';
import styles from '../LandingPage.module.css';

export function ProcessSteps() {
    const processRef = useRef<HTMLElement>(null);
    const processPanelY = useParallax(processRef, [50, -50]);

    return (
        <section ref={processRef} className="py-24 md:py-32 px-6">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 md:gap-16 items-start"
            >
                {/* Left — text */}
                <div className="md:w-1/2">
                    <motion.h2
                        variants={fadeUpVariants}
                        className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-12 leading-tight"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        De Zero a Viral<br />em 3 Passos
                    </motion.h2>

                    <div className="space-y-10">
                        {/* Step 01 */}
                        <motion.div variants={fadeUpVariants} className="flex items-start gap-4">
                            <div className={styles.stepCircle}>01</div>
                            <div>
                                <h3 className="font-bold text-base mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                                    Insira Seu Conceito
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}>
                                    Envie um texto, link ou até apenas um sentimento.
                                </p>
                            </div>
                        </motion.div>

                        {/* Step 02 */}
                        <motion.div variants={fadeUpVariants} className="flex items-start gap-4">
                            <div className={styles.stepCircle}>02</div>
                            <div>
                                <h3 className="font-bold text-base mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                                    Deixe a IA Dirigir
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}>
                                    Observe o motor criando design e copy perfeitamente integrados.
                                </p>
                            </div>
                        </motion.div>

                        {/* Step 03 */}
                        <motion.div variants={fadeUpVariants} className="flex items-start gap-4">
                            <div className={styles.stepCircle}>03</div>
                            <div>
                                <h3 className="font-bold text-base mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                                    Publique & Cresça
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}>
                                    Baixe ativos pixel-perfect ou agende diretamente.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right — illustrative panel */}
                <motion.div
                    variants={scaleUpVariants}
                    style={{ y: processPanelY }}
                    className="md:w-1/2 w-full"
                >
                    <div
                        className="rounded-2xl flex items-center justify-center w-full"
                        style={{
                            background: 'linear-gradient(145deg, rgba(124,58,237,0.04) 0%, rgba(50,30,80,0.15) 100%)',
                            border: '1px solid var(--lp-border)',
                            minHeight: '320px',
                        }}
                    >
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                            <Zap size={64} style={{ color: 'var(--lp-subtle)' }} strokeWidth={1} />
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
