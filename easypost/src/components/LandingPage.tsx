'use client';

import { Zap, Sparkles, Type, Maximize2, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './LandingPage.module.css';

// --- ANIMATION VARIANTS ---
const fadeUpVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
};

const scaleUpVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
    }
};

export default function LandingPage() {
    return (
        <div className={`${styles.root} lp-active`}>
            {/* ─── NAVBAR ─── */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex items-center justify-between px-6 md:px-12 py-4"
                style={{ borderBottom: '1px solid var(--lp-border)' }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div
                        className="flex items-center justify-center w-9 h-9 rounded-lg"
                        style={{ background: 'var(--lp-accent)' }}
                    >
                        <Zap size={18} color="#0a0a0a" strokeWidth={2.5} />
                    </div>
                    <span
                        className="text-lg font-bold"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--lp-text)' }}
                    >
                        EasyPost
                    </span>
                </div>

                {/* Nav Links — hidden on mobile */}
                <div
                    className="hidden md:flex items-center gap-8 text-sm"
                    style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}
                >
                    <a href="#" className="hover:text-white transition-colors">Produto</a>
                    <a href="#" className="hover:text-white transition-colors">Soluções</a>
                    <a href="#" className="hover:text-white transition-colors">Galeria</a>
                    <a href="#" className="hover:text-white transition-colors">Preços</a>
                </div>

                {/* Auth */}
                <div className="flex items-center gap-4">
                    <a
                        href="#"
                        className="hidden sm:inline text-sm hover:text-white transition-colors"
                        style={{ color: 'var(--lp-muted)', fontFamily: 'var(--font-body)' }}
                    >
                        Entrar
                    </a>
                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href="#"
                        className={`${styles.btnPrimary} !py-2 !px-5 !text-sm`}
                    >
                        Teste Grátis
                    </motion.a>
                </div>
            </motion.nav>

            {/* ─── HERO ─── */}
            <section className={`relative overflow-hidden py-24 md:py-36 px-6 text-center ${styles.glowBg}`}>
                <motion.div
                    initial="hidden"
                    animate="visible"
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

            {/* ─── AI DEMO MOCKUP ─── */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={scaleUpVariants}
                className="px-6 md:px-12 pb-24"
            >
                <div className={`max-w-5xl mx-auto p-6 md:p-10 ${styles.glassPanel}`}>
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left sidebar — settings */}
                        <div className="md:w-64 flex-shrink-0 space-y-6">
                            <p
                                className="text-xs font-semibold tracking-[0.15em] uppercase"
                                style={{ color: 'var(--lp-dim)' }}
                            >
                                Configurações de Geração
                            </p>

                            {/* Dropdowns */}
                            <div className="space-y-3">
                                <div
                                    className="flex items-center justify-between px-4 py-3 rounded-lg text-sm"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--lp-border)',
                                        color: 'var(--lp-muted)',
                                        fontFamily: 'var(--font-body)',
                                    }}
                                >
                                    <span>Estilo: Cinemático</span>
                                    <ChevronDown size={16} />
                                </div>
                                <div
                                    className="flex items-center justify-between px-4 py-3 rounded-lg text-sm"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--lp-border)',
                                        color: 'var(--lp-muted)',
                                        fontFamily: 'var(--font-body)',
                                    }}
                                >
                                    <span>Tom: Ousado & Viral</span>
                                    <ChevronDown size={16} />
                                </div>
                            </div>

                            {/* Brand Identity */}
                            <div>
                                <p
                                    className="text-xs font-semibold tracking-[0.15em] uppercase mb-3"
                                    style={{ color: 'var(--lp-dim)' }}
                                >
                                    Identidade Visual
                                </p>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full" style={{ background: 'var(--lp-accent)' }} />
                                    <div className="w-8 h-8 rounded-full" style={{ background: '#585858' }} />
                                    <div className="w-8 h-8 rounded-full" style={{ background: '#7e7e7e' }} />
                                </div>
                            </div>
                        </div>

                        {/* Right — preview area */}
                        <div className="flex-1 relative">
                            {/* Smart Layout badge */}
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute top-4 right-4 z-10"
                            >
                                <span className={`${styles.badge} !text-[0.65rem]`}>Smart Layout</span>
                            </motion.div>

                            {/* Image preview */}
                            <div
                                className="relative rounded-xl overflow-hidden flex items-center justify-center"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(200,255,0,0.06) 0%, rgba(120,100,60,0.15) 50%, rgba(30,30,20,0.3) 100%)',
                                    minHeight: '280px',
                                    border: '1px solid var(--lp-border)',
                                }}
                            >
                                {/* AI active overlay */}
                                <div className="text-center z-10">
                                    <motion.div
                                        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                        className="flex items-center justify-center mb-3"
                                    >
                                        <Sparkles size={32} style={{ color: 'var(--lp-accent)' }} />
                                    </motion.div>
                                    <p
                                        className="font-bold text-lg"
                                        style={{ color: 'var(--lp-accent)', fontFamily: 'var(--font-display)' }}
                                    >
                                        IA Gerando
                                    </p>
                                    <p
                                        className="text-sm italic mt-1"
                                        style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}
                                    >
                                        Otimizando layout para Instagram...
                                    </p>
                                </div>
                            </div>

                            {/* Color Correction badge */}
                            <div className="flex justify-center mt-4">
                                <span
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase"
                                    style={{
                                        border: '1px solid var(--lp-border)',
                                        color: 'var(--lp-muted)',
                                        fontFamily: 'var(--font-body)',
                                    }}
                                >
                                    Correção de Cor
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* ─── LOGOS BAR ─── */}
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
                    {['QUANTUM', 'VERTEX', 'PRISMA', 'FLOW', 'NOVA'].map((name, i) => (
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

            {/* ─── FEATURES GRID ─── */}
            <section className="py-24 md:py-32 px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="max-w-5xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-16">
                        <motion.h2
                            variants={fadeUpVariants}
                            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4"
                            style={{ fontFamily: 'var(--font-display)' }}
                        >
                            Ferramentas Mágicas para Criadores
                        </motion.h2>
                        <motion.p
                            variants={fadeUpVariants}
                            className="text-base max-w-xl mx-auto"
                            style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}
                        >
                            Tecnologia sofisticada por trás de uma interface simples e intuitiva.
                        </motion.p>
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1 — Magic Design */}
                        <motion.div variants={fadeUpVariants} className={styles.featureCard}>
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                                style={{ background: 'var(--lp-accent-muted)' }}
                            >
                                <Sparkles size={22} style={{ color: 'var(--lp-accent)' }} />
                            </div>
                            <h3
                                className="text-lg font-bold mb-2"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                Design Mágico
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}>
                                Gere layouts impressionantes que se adaptam ao tom emocional do seu conteúdo e identidade visual.
                            </p>
                        </motion.div>

                        {/* Card 2 — Smart Copywriting */}
                        <motion.div variants={fadeUpVariants} className={styles.featureCard}>
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--lp-border)' }}
                            >
                                <Type size={22} style={{ color: 'var(--lp-muted)' }} />
                            </div>
                            <h3
                                className="text-lg font-bold mb-2"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                Copywriting Inteligente
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}>
                                Legendas e títulos otimizados pela IA para conversão em cada plataforma social.
                            </p>
                        </motion.div>

                        {/* Card 3 — Instant Resize */}
                        <motion.div variants={fadeUpVariants} className={styles.featureCard}>
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                                style={{ background: 'var(--lp-accent-muted)' }}
                            >
                                <Maximize2 size={22} style={{ color: 'var(--lp-accent)' }} />
                            </div>
                            <h3
                                className="text-lg font-bold mb-2"
                                style={{ fontFamily: 'var(--font-display)' }}
                            >
                                Redimensionamento Instantâneo
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}>
                                Um clique para transformar seu post em Stories, banners do LinkedIn ou threads do Twitter.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* ─── 3-STEP PROCESS ─── */}
            <section className="py-24 md:py-32 px-6">
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
                    <motion.div variants={scaleUpVariants} className="md:w-1/2 w-full">
                        <div
                            className="rounded-2xl flex items-center justify-center w-full"
                            style={{
                                background: 'linear-gradient(145deg, rgba(200,255,0,0.04) 0%, rgba(50,50,30,0.15) 100%)',
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

            {/* ─── FINAL CTA ─── */}
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

            {/* ─── FOOTER ─── */}
            <footer
                className="px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4"
                style={{ borderTop: '1px solid var(--lp-border)' }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div
                        className="flex items-center justify-center w-7 h-7 rounded-md"
                        style={{ background: 'var(--lp-accent)' }}
                    >
                        <Zap size={14} color="#0a0a0a" strokeWidth={2.5} />
                    </div>
                    <span
                        className="text-sm font-bold"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--lp-text)' }}
                    >
                        EasyPost
                    </span>
                </div>

                {/* Links */}
                <div
                    className="flex items-center gap-6 text-sm"
                    style={{ color: 'var(--lp-dim)', fontFamily: 'var(--font-body)' }}
                >
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="hover:text-white transition-colors">Comunidade</a>
                    <a href="#" className="hover:text-white transition-colors">Changelog</a>
                    <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                </div>

                {/* Copyright */}
                <p className="text-xs" style={{ color: 'var(--lp-subtle)', fontFamily: 'var(--font-body)' }}>
                    © 2025 EasyPost Inc. Todos os direitos reservados.
                </p>
            </footer>
        </div>
    );
}
