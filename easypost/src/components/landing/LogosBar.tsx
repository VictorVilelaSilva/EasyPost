'use client';

import { motion } from 'framer-motion';
import { staggerContainer, fadeUpVariants } from './animations';

const LOGOS = ['QUANTUM', 'VERTEX', 'PRISMA', 'FLOW', 'NOVA'];

export function LogosBar() {
    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="py-16 px-6 text-center"
            style={{ borderTop: '1px solid var(--lp-border)', borderBottom: '1px solid var(--lp-border)' }}
        >
            <motion.p
                variants={fadeUpVariants}
                className="text-xs font-semibold tracking-[0.2em] uppercase mb-8"
                style={{ color: 'var(--lp-subtle)', fontFamily: 'var(--font-body)' }}
            >
                Líderes Confiam no EasyPost
            </motion.p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
                {LOGOS.map((name, i) => (
                    <motion.span
                        variants={fadeUpVariants}
                        key={name}
                        className="text-base md:text-lg tracking-[0.15em] uppercase hover:text-white transition-colors duration-300 cursor-default"
                        style={{
                            color: 'var(--lp-subtle)',
                            fontFamily: 'var(--font-display)',
                            fontWeight: i === 1 ? 400 : 300,
                            fontStyle: i === 1 ? 'italic' : 'normal',
                        }}
                    >
                        {name}
                    </motion.span>
                ))}
            </div>
        </motion.section>
    );
}
