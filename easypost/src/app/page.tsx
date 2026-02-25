import HomeClient from '../components/HomeClient';

export default function Home() {
  return (
    <main className="relative min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8" style={{ color: 'var(--color-text)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Hero — Server-rendered for SEO & fast paint */}
        <div className="relative text-center mb-12 sm:mb-16 animate-reveal">
          {/* Floating gradient orb for depth */}
          <div
            className="floating-orb"
            style={{ top: '-120px', left: '50%', marginLeft: '-200px' }}
            aria-hidden="true"
          />

          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold gradient-text-shimmer mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            EasyPost
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
            Digite seu nicho de conteúdo. Receba 15 temas em alta. Gere imagens de carrossel e legendas prontas para publicar.
          </p>

          {/* Social proof */}
          <p className="mt-4 text-sm" style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-body)' }}>
            ✨ Crie carrosséis profissionais em segundos com IA
          </p>
        </div>

        {/* Interactive section — Client Component */}
        <HomeClient />
      </div>
    </main>
  );
}
