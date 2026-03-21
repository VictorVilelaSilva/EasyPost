'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from './animations';

export default function HeroSection() {
    const router = useRouter();

    const scrollToShowcase = () => {
        document.getElementById('showcase')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-16 pt-16 pb-20 lg:pt-28 lg:pb-36 grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-center relative z-10">
            {/* Text column */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-7"
            >
                <motion.div
                    variants={fadeInUp}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple/10 border border-purple/20 text-purple text-xs font-bold uppercase tracking-wider font-body"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple" />
                    </span>
                    Carrosséis com IA
                </motion.div>

                <motion.h1
                    variants={fadeInUp}
                    className="text-4xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] text-white font-display"
                >
                    Crie carrosséis profissionais para Instagram em{' '}
                    <span className="text-purple">minutos.</span>
                </motion.h1>

                <motion.p
                    variants={fadeInUp}
                    className="text-lg lg:text-xl text-slate-400 max-w-xl leading-relaxed font-body"
                >
                    Digite seu nicho, escolha um tema e a IA gera slides completos com imagens, textos e legendas. Pronto para postar.
                </motion.p>

                <motion.div
                    variants={fadeInUp}
                    className="flex flex-col sm:flex-row gap-4 pt-2"
                >
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-purple text-white px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-purple/20 hover:shadow-2xl hover:shadow-purple/30 cursor-pointer font-display"
                    >
                        Criar Meu Primeiro Post
                    </button>
                    <button
                        onClick={scrollToShowcase}
                        className="px-8 py-4 rounded-xl font-semibold text-lg text-slate-300 border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer font-body"
                    >
                        Ver exemplos abaixo
                    </button>
                </motion.div>
            </motion.div>

            {/* Screenshot column */}
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative group"
            >
                {/* Ambient glow */}
                <div className="absolute -inset-8 bg-gradient-to-tr from-purple/15 to-purple-deep/10 blur-[80px] opacity-50 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />

                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-purple/10">
                    <Image
                        src="/fluxo/resultado.png"
                        alt="Resultado gerado pelo EasyPost — slide de carrossel no editor visual"
                        width={1200}
                        height={800}
                        priority
                        quality={90}
                        className="w-full h-auto"
                    />
                </div>
            </motion.div>
        </section>
    );
}
