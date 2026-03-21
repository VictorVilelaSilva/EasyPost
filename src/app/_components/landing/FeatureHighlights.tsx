'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from './animations';

const features = [
    {
        icon: 'auto_awesome',
        title: 'Imagens geradas por IA',
        description: 'Cada slide vem com ilustrações únicas criadas pela IA. Nada de banco de imagens genérico.',
    },
    {
        icon: 'text_fields',
        title: 'Texto já renderizado',
        description: 'Os slides já vêm com título, corpo e CTA escritos e posicionados. É só baixar e postar.',
    },
    {
        icon: 'palette',
        title: 'Sua identidade visual',
        description: 'Defina cores, suba referências e a IA respeita o estilo do seu perfil.',
    },
    {
        icon: 'drag_indicator',
        title: 'Editor visual integrado',
        description: 'Arraste textos, ajuste fontes e tamanhos no editor antes de exportar.',
    },
    {
        icon: 'description',
        title: 'Legenda pronta',
        description: 'Além dos slides, a IA gera a legenda completa com hashtags para copiar e colar.',
    },
    {
        icon: 'download',
        title: 'Download em ZIP',
        description: 'Baixe todos os slides de uma vez em alta resolução, pronto para agendar.',
    },
];

export default function FeatureHighlights() {
    return (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-16 py-24 relative z-10">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeInUp}
                className="text-center mb-16"
            >
                <h2 className="text-3xl lg:text-5xl font-bold text-white font-display">
                    Tudo que você precisa em uma ferramenta
                </h2>
            </motion.div>

            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
                {features.map((feature) => (
                    <motion.div
                        key={feature.title}
                        variants={fadeInUp}
                        className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm hover:border-purple/20 hover:bg-white/[0.04] transition-all duration-500"
                    >
                        {/* Glow on hover */}
                        <div className="absolute inset-0 rounded-2xl bg-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="w-11 h-11 rounded-xl bg-purple/10 border border-purple/15 flex items-center justify-center mb-5">
                                <span className="material-symbols-outlined text-purple text-xl">{feature.icon}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 font-display">{feature.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed font-body">{feature.description}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
