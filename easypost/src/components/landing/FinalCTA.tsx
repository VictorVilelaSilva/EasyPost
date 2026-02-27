'use client';

import { motion } from 'framer-motion';
import { scaleUpVariants, fadeUpVariants } from './animations';
import styles from '../LandingPage.module.css';

export function FinalCTA() {
    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleUpVariants}
            className={`relative py-28 md:py-40 px-6 text-center ${styles.glowBg}`}
        >
            <div className="relative z-10 max-w-3xl mx-auto">
                <motion.h2
                    variants={fadeUpVariants}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
                    style={{ fontFamily: 'var(--font-display)' }}
                >
                    Junte-se ao Futuro<br />do Conteúdo.
                </motion.h2>
                <motion.p
                    variants={fadeUpVariants}
                    className="text-base md:text-lg mb-10"
                    style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}
                >
                    Comece a criar visuais profissionais para redes sociais com IA hoje. Sem cartão de crédito.
                </motion.p>
                <motion.div variants={fadeUpVariants}>
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href="#"
                        className={`${styles.btnPrimary} text-lg px-10 py-4 inline-block`}
                    >
                        Comece Grátis
                    </motion.a>
                </motion.div>
                <motion.p
                    variants={fadeUpVariants}
                    className="mt-6 text-xs tracking-[0.15em] uppercase flex items-center justify-center gap-2"
                    style={{ color: 'var(--lp-subtle)', fontFamily: 'var(--font-body)' }}
                >
                    <span>🔒</span> Protegido por IA de nível empresarial
                </motion.p>
            </div>
        </motion.section>
    );
}
