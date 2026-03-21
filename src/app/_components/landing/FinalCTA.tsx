'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fadeInUp } from './animations';

export default function FinalCTA() {
    const router = useRouter();

    return (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-16 py-24 relative z-10">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={fadeInUp}
                className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-darker via-purple-dark to-purple-darker p-10 lg:p-20 text-center border border-white/5"
            >
                {/* Dotted pattern overlay */}
                <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)',
                        backgroundSize: '24px 24px',
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-purple/10 via-transparent to-purple-deep/10 pointer-events-none" />

                <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight font-display">
                        Seu próximo carrossel está a<br />3 cliques de distância
                    </h2>
                    <p className="text-slate-300 text-lg max-w-xl mx-auto font-body">
                        Escolha o nicho, configure o visual e deixe a IA fazer o resto.
                    </p>
                    <div className="pt-4">
                        <motion.button
                            onClick={() => router.push('/login')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-purple text-white px-10 py-4 rounded-2xl font-bold text-lg hover:brightness-110 shadow-2xl shadow-purple/40 cursor-pointer font-display"
                        >
                            Criar Meu Carrossel Agora
                        </motion.button>
                    </div>
                    <p className="text-white/40 text-sm font-body">
                        Gratuito para começar. Sem cartão de crédito.
                    </p>
                </div>
            </motion.div>
        </section>
    );
}
