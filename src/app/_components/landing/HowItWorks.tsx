'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeInUp, slideInLeft, slideInRight } from './animations';

const steps = [
    {
        number: '01',
        title: 'Escolha a plataforma e o tema',
        description: 'Selecione Instagram, LinkedIn, X ou TikTok. Defina seu nicho, o assunto do post e quantos slides quer.',
        image: '/fluxo/Step1.png',
        imageRight: true,
    },
    {
        number: '02',
        title: 'Suba suas referências visuais',
        description: 'Envie imagens de referência para capa, conteúdo e CTA. A IA mantém a identidade visual do seu perfil.',
        image: '/fluxo/Step2.png',
        imageRight: false,
    },
    {
        number: '03',
        title: 'Configure e gere com IA',
        description: 'Ajuste cores, público-alvo e estilo de texto. A IA gera todas as imagens com texto renderizado, prontas para postar.',
        image: '/fluxo/step3.png',
        imageRight: true,
    },
];

export default function HowItWorks() {
    return (
        <section className="py-24 relative z-10">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeInUp}
                className="max-w-[1400px] mx-auto px-6 lg:px-16 text-center mb-20"
            >
                <span className="text-purple text-sm font-bold uppercase tracking-widest font-body">
                    Como funciona
                </span>
                <h2 className="text-3xl lg:text-5xl font-bold text-white mt-4 font-display">
                    3 passos. Carrossel pronto.
                </h2>
            </motion.div>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-16 space-y-20 lg:space-y-32">
                {steps.map((step) => {
                    const textVariant = step.imageRight ? slideInLeft : slideInRight;
                    const imageVariant = step.imageRight ? slideInRight : slideInLeft;

                    return (
                        <div
                            key={step.number}
                            className={`grid lg:grid-cols-12 gap-10 lg:gap-16 items-center`}
                        >
                            {/* Text */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-100px' }}
                                variants={textVariant}
                                className={`lg:col-span-5 space-y-5 ${step.imageRight ? 'order-1' : 'order-1 lg:order-2'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="w-12 h-12 rounded-full border-2 border-purple flex items-center justify-center text-purple text-sm font-bold font-display shrink-0">
                                        {step.number}
                                    </span>
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-bold text-white font-display">
                                    {step.title}
                                </h3>
                                <p className="text-slate-400 text-lg leading-relaxed font-body">
                                    {step.description}
                                </p>
                            </motion.div>

                            {/* Screenshot */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-100px' }}
                                variants={imageVariant}
                                className={`lg:col-span-7 ${step.imageRight ? 'order-2' : 'order-2 lg:order-1'}`}
                            >
                                <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-[#0a0a0a] shadow-2xl shadow-purple/5 group">
                                    <Image
                                        src={step.image}
                                        alt={step.title}
                                        width={1200}
                                        height={675}
                                        className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02] opacity-90"
                                        quality={85}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
