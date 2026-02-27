'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from './Logo';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function LandingPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    // Scroll Parallax using Framer Motion (global window scroll — avoids SSR hydration issues)
    const { scrollYProgress } = useScroll();

    // Background mesh moves slower (parallax)
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    // Hero interactive widget moves up slightly
    const heroRightY = useTransform(scrollYProgress, [0, 0.4], ["0%", "-15%"]);
    // Story section mockups
    const mockup1Y = useTransform(scrollYProgress, [0, 0.5], ["10%", "-5%"]);
    const mockup2Y = useTransform(scrollYProgress, [0.2, 0.7], ["10%", "-5%"]);
    const mockup3Y = useTransform(scrollYProgress, [0.4, 0.9], ["10%", "-5%"]);

    // Animation Configs
    const fadeInUp = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
    };

    const slideInLeft = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    useEffect(() => {
        if (!loading && user) {
            router.replace('/create');
        }
    }, [user, loading, router]);

    if (loading || user) {
        return <div className="min-h-screen bg-black" />;
    }

    return (
        <div className="bg-[#000000] text-slate-200 font-['Spline_Sans'] selection:bg-[#A855F7]/30 min-h-screen relative z-10 overflow-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700;800&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                
                .sticky-nav {
                    backdrop-filter: blur(16px);
                    background-color: rgba(0, 0, 0, 0.75);
                }
                .dotted-pattern {
                    background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
                    background-size: 24px 24px;
                }
            `}</style>

            {/* Cinematic Parallax Background */}
            <motion.div
                className="fixed inset-0 z-[-1]"
                style={{
                    y: backgroundY,
                    backgroundColor: '#000000',
                    backgroundImage: `
                        radial-gradient(at 0% 0%, rgba(168, 85, 247, 0.12) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, rgba(124, 58, 237, 0.12) 0px, transparent 50%)
                    `
                }}
            />

            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="sticky-nav fixed top-0 w-full z-50 border-b border-white/5"
            >
                <div className="w-full px-6 lg:px-12 xl:px-16 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo />
                    </div>
                    <div className="hidden md:flex items-center gap-10">
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white px-4 py-2">
                            Entrar
                        </Link>
                        <Link href="/create" className="bg-[#A855F7] hover:bg-[#A855F7]/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#A855F7]/25 hover:scale-105 active:scale-95">
                            Começar grátis
                        </Link>
                    </div>
                </div>
            </motion.nav>

            <main className="pt-20 min-h-screen">
                <section className="max-w-[1400px] mx-auto px-6 lg:px-16 py-20 lg:py-36 grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-24 items-center">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8 relative z-10"
                    >
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A855F7]/10 border border-[#A855F7]/20 text-[#A855F7] text-xs font-bold uppercase tracking-wider">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A855F7] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A855F7]"></span>
                            </span>
                            Artes Visuais com IA
                        </motion.div>
                        <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-extrabold leading-[1.1] text-white">
                            Transforme sua <span className="text-[#A855F7]">presença digital</span> com a magia da IA.
                        </motion.h1>
                        <motion.p variants={fadeInUp} className="text-xl text-slate-400 max-w-xl leading-relaxed">
                            Crie stories e carrosséis visuais deslumbrantes para o Instagram e LinkedIn em segundos. O poder de um estúdio de design criativo inteiro focado na mesma ferramenta.
                        </motion.p>
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 pt-4">
                            <div className="relative flex-1 max-w-md">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
                                <input className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all" placeholder="Digite seu melhor e-mail" type="email" />
                            </div>
                            <button onClick={() => router.push('/login')} className="bg-[#A855F7] text-white px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[#A855F7]/20 hover:shadow-2xl hover:shadow-[#A855F7]/30">
                                Começar a Criar
                            </button>
                        </motion.div>
                        <motion.div variants={fadeInUp} className="flex items-center gap-6 pt-4 text-slate-500">
                            <div className="flex -space-x-3">
                                <Image className="w-10 h-10 rounded-full border-2 border-[#000000]" alt="User avatar 1" src="/stitch_assets/avatar1.jpg" width={40} height={40} />
                                <Image className="w-10 h-10 rounded-full border-2 border-[#000000]" alt="User avatar 2" src="/stitch_assets/avatar2.jpg" width={40} height={40} />
                                <Image className="w-10 h-10 rounded-full border-2 border-[#000000]" alt="User avatar 3" src="/stitch_assets/avatar3.jpg" width={40} height={40} />
                            </div>
                            <span className="text-sm font-medium">Junte-se a 10.000+ top criadores</span>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                        style={{ y: heroRightY }}
                        className="relative group z-10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#A855F7]/30 to-[#7C3AED]/30 blur-[100px] opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
                        <div className="relative bg-[#0F0F0F]/60 border border-white/10 p-8 rounded-[2rem] shadow-2xl backdrop-blur-md">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center p-6 border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="material-symbols-outlined text-6xl text-slate-500">photo_library</span>
                                </div>
                                <div className="aspect-square bg-[#A855F7]/15 rounded-2xl flex items-center justify-center p-6 border border-[#A855F7]/20 relative overflow-hidden group/star">
                                    <span className="material-symbols-outlined text-6xl text-[#A855F7] relative z-10 group-hover/star:scale-110 transition-transform">auto_awesome</span>
                                    <div className="absolute inset-0 bg-[#A855F7]/5 animate-pulse"></div>
                                </div>
                                <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center p-6 border border-white/5 hover:bg-white/10 transition-colors">
                                    <span className="material-symbols-outlined text-6xl text-slate-500">share</span>
                                </div>
                                <div className="aspect-square bg-[#7C3AED]/15 rounded-2xl flex items-center justify-center p-6 border border-[#7C3AED]/20">
                                    <span className="material-symbols-outlined text-6xl text-[#7C3AED]">insights</span>
                                </div>
                            </div>
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -top-6 -right-6 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-[#A855F7]/50 border"
                            >
                                <span className="material-symbols-outlined text-[#A855F7] text-3xl font-bold">star</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </section>

                <section className="py-24 space-y-32 relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="max-w-[1400px] mx-auto px-6 lg:px-16 text-center"
                    >
                        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Visuais que geram resultados</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            Pare de adivinhar como ficarão suas postagens. O nosso motor pré-visualização interativa permite que você veja perfeitamente como seu conteúdo será revelado ao seu público antes de publicar.
                        </p>
                    </motion.div>

                    {/* Story 1 */}
                    <div className="relative">
                        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
                            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={slideInLeft}
                                    className="lg:col-span-5 space-y-6"
                                >
                                    <div className="w-12 h-12 bg-[#A855F7]/10 border border-[#A855F7]/20 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#A855F7]">photo_camera</span>
                                    </div>
                                    <h3 className="text-4xl font-bold text-white">Carrosséis de Instagram</h3>
                                    <p className="text-slate-400 text-lg">
                                        Crie layouts cativantes que travam a rolagem dos dedos. IA sugere elementos decorativos, formatação visual e as melhores tipografias para fisgar sua base.
                                    </p>
                                    <ul className="space-y-4 pt-4">
                                        <li className="flex items-center gap-3 text-slate-300 font-medium">
                                            <span className="material-symbols-outlined text-[#A855F7]">check_circle</span>
                                            Otimização de Layout por IA
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300 font-medium">
                                            <span className="material-symbols-outlined text-[#A855F7]">check_circle</span>
                                            Harmonização de cores em um clique
                                        </li>
                                    </ul>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8 }}
                                    style={{ y: mockup1Y }}
                                    className="lg:col-span-7"
                                >
                                    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-[#A855F7]/10 bg-[#0F0F0F] group">
                                        <div className="bg-center bg-no-repeat aspect-[16/9] bg-cover transition-transform duration-700 group-hover:scale-105 opacity-90" style={{ backgroundImage: 'url("/stitch_assets/mockup1.jpg")' }}></div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Story 2 */}
                    <div className="relative bg-gradient-to-b from-transparent via-[#0F0F0F]/80 to-transparent py-24 my-10">
                        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
                            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8 }}
                                    style={{ y: mockup2Y }}
                                    className="lg:col-span-7 order-2 lg:order-1"
                                >
                                    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-[#7C3AED]/10 bg-[#0F0F0F] group">
                                        <div className="bg-center bg-no-repeat aspect-[16/9] bg-cover transition-transform duration-700 group-hover:scale-105 opacity-90" style={{ backgroundImage: 'url("/stitch_assets/mockup2.jpg")' }}></div>
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                    variants={slideInRight}
                                    className="lg:col-span-5 space-y-6 order-1 lg:order-2"
                                >
                                    <div className="w-12 h-12 bg-[#A855F7]/10 border border-[#A855F7]/20 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#A855F7]">view_carousel</span>
                                    </div>
                                    <h3 className="text-4xl font-bold text-white">Carrosséis Profissionais</h3>
                                    <p className="text-slate-400 text-lg">
                                        Apresentações profissionais que geram autoridade no mercado. Converta seus artigos inteiros ou ideias de texto para um visual de alto impacto para o LinkedIn.
                                    </p>
                                    <ul className="space-y-4 pt-4">
                                        <li className="flex items-center gap-3 text-slate-300 font-medium">
                                            <span className="material-symbols-outlined text-[#A855F7]">check_circle</span>
                                            Geração autônoma de slides
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300 font-medium">
                                            <span className="material-symbols-outlined text-[#A855F7]">check_circle</span>
                                            Sincronize com o kit da marca
                                        </li>
                                    </ul>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Story 3 */}
                    <div className="relative pb-24">
                        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
                            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-200px" }}
                                    variants={slideInLeft}
                                    className="lg:col-span-5 space-y-6"
                                >
                                    <div className="w-12 h-12 bg-[#A855F7]/10 border border-[#A855F7]/20 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#A855F7]">image</span>
                                    </div>
                                    <h3 className="text-4xl font-bold text-white">Visuais para Stories</h3>
                                    <p className="text-slate-400 text-lg">
                                        Postagens ricas em engajamento para os seus stories do dia a dia. Extraia trechos poderosos e resumos automáticos que aumentam drasticamente seu CTR.
                                    </p>
                                    <ul className="space-y-4 pt-4">
                                        <li className="flex items-center gap-3 text-slate-300 font-medium">
                                            <span className="material-symbols-outlined text-[#A855F7]">check_circle</span>
                                            Múltiplos formatos automáticos
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300 font-medium">
                                            <span className="material-symbols-outlined text-[#A855F7]">check_circle</span>
                                            Pré-visualize no celular em 1-clique
                                        </li>
                                    </ul>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, margin: "-200px" }}
                                    transition={{ duration: 0.8 }}
                                    style={{ y: mockup3Y }}
                                    className="lg:col-span-7"
                                >
                                    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-[#A855F7]/10 bg-[#0F0F0F] group">
                                        <div className="bg-center bg-no-repeat aspect-[16/9] bg-cover transition-transform duration-700 group-hover:scale-105 opacity-90" style={{ backgroundImage: 'url("/stitch_assets/mockup3.jpg")' }}></div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-[1400px] mx-auto px-6 lg:px-16 py-24 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#1E0B36] via-[#2D1150] to-[#1E0B36] p-12 lg:p-24 text-center border border-white/5"
                    >
                        <div className="absolute inset-0 dotted-pattern opacity-40"></div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#A855F7]/10 via-transparent to-[#7C3AED]/10"></div>
                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">Pronto para criar <br />suas histórias visuais?</h2>
                            <p className="text-slate-300 text-lg lg:text-xl max-w-2xl mx-auto font-medium">
                                Junte-se a 10.000+ criadores que usam o EasyPost para turbinar seu conteúdo criativo no piloto automático.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                <motion.button
                                    onClick={() => router.push('/login')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-[#A855F7] text-white px-10 py-5 rounded-2xl font-bold text-xl hover:brightness-110 shadow-2xl shadow-[#A855F7]/40 cursor-pointer"
                                >
                                    Começar Grátis
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/10 transition-colors"
                                >
                                    Ver Demonstração ao vivo
                                </motion.button>
                            </div>
                            <p className="text-white/50 text-sm font-medium">Cartão de Crédito não requerido • Comece gratuitamente</p>
                        </div>
                    </motion.div>
                </section>

                <footer className="border-t border-white/5 py-12 bg-black relative z-10">
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
                        <div className="col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <Logo />
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                                O super studio criativo em um aplicativo alimentado pela IA para criadores digitais e equipes brilhantes.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Produto</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Funcionalidades</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Integrações</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Modelos e Temas</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Preços</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Empresa</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Sobre nós</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Carreiras</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Blog</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Contatos</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Suporte</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Central de ajuda</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Docs de API</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Nossa comunidade</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Jurídico</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Privacidade</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Termos de Uso</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="max-w-[1400px] mx-auto px-6 lg:px-16 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-slate-500 text-sm">© 2026 EasyPost AI. Todos os direitos reservados.</p>
                        <div className="flex gap-6">
                            <a className="text-slate-500 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
                            <a className="text-slate-500 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
                            <a className="text-slate-500 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
