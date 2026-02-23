'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import TopicList from '../components/TopicList';
import CarouselPreview from '../components/CarouselPreview';
import ImageConfigPanel from '../components/ImageConfig';
import { CarouselData, ImageConfig } from '../types';

export default function Home() {
  const [niche, setNiche] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
  const [images, setImages] = useState<string[] | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  const handleGenerateTopics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;

    setIsGeneratingTopics(true);
    setTopics([]);
    setSelectedTopic(null);
    setCarouselData(null);
    setImages(null);
    setShowConfig(false);

    try {
      const res = await fetch('/api/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche }),
      });
      const data = await res.json();
      if (data.topics) {
        setTopics(data.topics);
      } else {
        alert(data.error || 'Falha ao gerar tópicos');
      }
    } catch (e) {
      console.error(e);
      alert('Erro de conexão ao gerar tópicos');
    }
    setIsGeneratingTopics(false);
  };

  const handleSelectTopic = async (topic: string) => {
    setSelectedTopic(topic);
    setIsGeneratingText(true);
    setCarouselData(null);
    setImages(null);
    setShowConfig(false);

    try {
      const resText = await fetch('/api/generate-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, niche }),
      });
      const dataText = await resText.json();

      if (!dataText.slides || !dataText.caption) {
        throw new Error(dataText.error || 'Falha ao gerar texto do carrossel');
      }
      setCarouselData(dataText);
      setShowConfig(true);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Erro de conexão ao gerar texto do carrossel');
    }
    setIsGeneratingText(false);
  };

  const handleGenerateImages = async (config: ImageConfig) => {
    if (!carouselData) return;

    setIsGeneratingImages(true);
    setImages(null);
    setShowConfig(false);

    try {
      const resImages = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: carouselData.slides,
          visualStyle: config.visualStyle,
          colorPalette: config.colorPalette,
          audience: config.audience,
          customPrompt: config.customPrompt,
        }),
      });
      const dataImages = await resImages.json();

      if (!dataImages.images) {
        throw new Error(dataImages.error || 'Falha ao gerar imagens');
      }

      setImages(dataImages.images);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Erro de conexão ao gerar imagens');
      setShowConfig(true);
    }
    setIsGeneratingImages(false);
  };

  return (
    <main className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8" style={{ color: 'var(--color-text)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16 animate-reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-medium tracking-wide" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
            <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
            Criado com Gemini AI
          </div>
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold gradient-text-shimmer mb-5 leading-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            EasyPost
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
            Digite seu nicho de conteúdo. Receba 15 temas em alta. Gere imagens de carrossel e legendas prontas para publicar no Instagram.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleGenerateTopics} className="max-w-2xl mx-auto mb-12 animate-reveal animate-reveal-delay-1">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ex: Dicas de Design, Fitness para iniciantes..."
              aria-label="Seu nicho de conteúdo"
              className="input-glow flex-1 px-5 py-3.5 rounded-xl text-base"
              style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                minHeight: '48px',
              }}
              required
            />
            <button
              type="submit"
              disabled={isGeneratingTopics || !niche.trim()}
              aria-label="Buscar temas em alta"
              className="btn-glow cursor-pointer px-7 py-3.5 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                fontFamily: 'var(--font-display)',
                minHeight: '48px',
              }}
            >
              {isGeneratingTopics ? <Loader2 className="animate-spin" size={20} /> : 'Buscar Temas'}
            </button>
          </div>
        </form>

        {/* Loading: gerando texto */}
        {isGeneratingText && (
          <div className="flex flex-col items-center justify-center py-16 glass-card-static mb-8 animate-reveal" style={{ borderStyle: 'dashed' }}>
            <Loader2 className="animate-spin mb-4" size={40} style={{ color: 'var(--color-primary)' }} />
            <p className="font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
              Gerando texto dos slides e legenda...
            </p>
          </div>
        )}

        {/* Painel de Configuração */}
        {showConfig && carouselData && selectedTopic && (
          <ImageConfigPanel
            topic={selectedTopic}
            onGenerate={handleGenerateImages}
            isLoading={isGeneratingImages}
          />
        )}

        {/* Loading: gerando imagens */}
        {isGeneratingImages && (
          <div className="flex flex-col items-center justify-center py-16 glass-card-static mb-8 animate-reveal" style={{ borderStyle: 'dashed' }}>
            <Loader2 className="animate-spin mb-4" size={40} style={{ color: 'var(--color-accent)' }} />
            <p className="font-medium" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
              Criando suas 5 imagens com IA. Isso pode levar alguns segundos...
            </p>
          </div>
        )}

        {/* Preview do Carrossel */}
        {!isGeneratingImages && carouselData && selectedTopic && images && (
          <CarouselPreview data={carouselData} topic={selectedTopic} images={images} />
        )}

        {/* Lista de Temas */}
        {!carouselData && !isGeneratingText && (
          <TopicList
            topics={topics}
            onSelect={handleSelectTopic}
            isLoadingCarousel={isGeneratingText}
          />
        )}
      </div>
    </main>
  );
}
