'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from './animations';

const showcases = [
    { label: 'Fitness', image: '/creations/Fitness/slide_1.png', accent: 'from-blue-500/20 to-blue-600/5' },
    { label: 'Psicologia', image: '/creations/psicologia/slide_1.png', accent: 'from-orange-500/20 to-orange-600/5' },
    { label: 'Tech & Dev', image: '/creations/desenvolvimento/slide_1.png', accent: 'from-purple/20 to-purple-deep/5' },
    { label: 'E-commerce', image: '/creations/mercado_livre/slide_1.png', accent: 'from-yellow-500/20 to-yellow-600/5' },
];

export default function ShowcaseGallery() {
    return (
        <section id="showcase" className="max-w-[1400px] mx-auto px-6 lg:px-16 py-24 relative z-10">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeInUp}
                className="text-center mb-16 space-y-4"
            >
                <span className="text-purple text-sm font-bold uppercase tracking-widest font-body">
                    Resultados reais
                </span>
                <h2 className="text-3xl lg:text-5xl font-bold text-white font-display">
                    Um post profissional para qualquer nicho
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg font-body leading-relaxed">
                    Veja o que a IA do EasyPost criou em menos de 2 minutos. Cada carrossel abaixo foi
                    gerado automaticamente — imagens, textos e layout.
                </p>
            </motion.div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={staggerContainer}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
            >
                {showcases.map((item) => (
                    <motion.div
                        key={item.label}
                        variants={fadeInUp}
                        className="group relative"
                    >
                        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/5 bg-[#0a0a0a] transition-all duration-500 group-hover:border-purple/30 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.12)]">
                            <Image
                                src={item.image}
                                alt={`Exemplo de carrossel — ${item.label}`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                sizes="(max-width: 768px) 50vw, 25vw"
                            />

                            {/* Gradient overlay at bottom for label */}
                            <div className={`absolute inset-0 bg-gradient-to-t ${item.accent} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                            {/* Label badge */}
                            <div className="absolute top-3 left-3">
                                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white uppercase tracking-wider font-body">
                                    {item.label}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
