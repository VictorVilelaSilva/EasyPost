import HomeClient from '../../components/HomeClient';
import Navbar from '../../components/Navbar';

export const metadata = {
    title: 'Criar Carrossel — EasyPost',
    description: 'Crie seu carrossel para Instagram com IA. Escolha um nicho, selecione um tema e gere slides prontos para postar.',
};

export default function CreatePage() {
    return (
        <>
            <Navbar />
            <main
                className="min-h-screen flex flex-col items-center px-4 py-16"
                style={{ fontFamily: 'var(--font-body)' }}
            >
                {/* Header */}
                <div className="text-center mb-10 animate-reveal">
                    <h1
                        className="text-3xl sm:text-4xl font-bold mb-3"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
                    >
                        Crie seu Carrossel
                    </h1>
                    <p
                        className="text-base max-w-lg mx-auto"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        Digite seu nicho, escolha um tema em alta e deixe a IA gerar slides e imagens prontos para o Instagram.
                    </p>
                </div>

                {/* Conteúdo principal */}
                <section className="w-full max-w-4xl">
                    <HomeClient />
                </section>
            </main>
        </>
    );
}
