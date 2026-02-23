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
        alert(data.error || 'Failed to generate topics');
      }
    } catch (e) {
      console.error(e);
      alert('Network error while generating topics');
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
      // Step 1: Generate the Text (Caption + Slides Outline)
      const resText = await fetch('/api/generate-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, niche }),
      });
      const dataText = await resText.json();

      if (!dataText.slides || !dataText.caption) {
        throw new Error(dataText.error || 'Failed to generate carousel text');
      }
      setCarouselData(dataText);
      setShowConfig(true); // Show the config panel
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Network error while generating carousel text');
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
        throw new Error(dataImages.error || 'Failed to generate images');
      }

      setImages(dataImages.images);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Network error while generating images');
      setShowConfig(true); // Show config again so user can retry
    }
    setIsGeneratingImages(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-4 inline-flex items-center gap-3">
            <Sparkles className="text-blue-400" /> EasyPost Generator
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Just type your content niche. We will find 15 trending topics and automatically generate a complete 5-slide visual carousel and caption ready for Instagram.
          </p>
        </div>

        <form onSubmit={handleGenerateTopics} className="max-w-xl mx-auto mb-10">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Graphic Design Tips, Fitness for beginners..."
              className="flex-1 px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
            <button
              type="submit"
              disabled={isGeneratingTopics || !niche.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {isGeneratingTopics ? <Loader2 className="animate-spin" size={20} /> : 'Find Topics'}
            </button>
          </div>
        </form>

        {/* Loading: generating text */}
        {isGeneratingText && (
          <div className="flex flex-col items-center justify-center py-12 bg-slate-800/50 rounded-2xl border border-slate-800 mb-8 border-dashed">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
            <p className="text-slate-300 font-medium">Gerando texto dos slides e caption...</p>
          </div>
        )}

        {/* Config Panel: shown after text is generated, before images */}
        {showConfig && carouselData && selectedTopic && (
          <ImageConfigPanel
            topic={selectedTopic}
            onGenerate={handleGenerateImages}
            isLoading={isGeneratingImages}
          />
        )}

        {/* Loading: generating images */}
        {isGeneratingImages && (
          <div className="flex flex-col items-center justify-center py-12 bg-slate-800/50 rounded-2xl border border-slate-800 mb-8 border-dashed">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
            <p className="text-slate-300 font-medium">Gerando suas 5 imagens com IA. Isso pode levar alguns segundos...</p>
          </div>
        )}

        {/* Carousel Preview: shown after images are generated */}
        {!isGeneratingImages && carouselData && selectedTopic && images && (
          <CarouselPreview data={carouselData} topic={selectedTopic} images={images} />
        )}

        {/* Topic List: shown when no topic is selected yet */}
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
