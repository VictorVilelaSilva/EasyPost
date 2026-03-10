"use client";

import dynamic from "next/dynamic";
import { Loader2, Sparkles } from "lucide-react";
import TopicList from "./TopicList";
import LoadingCard from "./LoadingCard";
import { useCarouselWorkflow } from "../hooks/useCarouselWorkflow";
import ExclusiveCheckbox from "@/components/ExclusiveCheckbox";
import TextInput from "@/components/TextInput";
import { Instagram, Linkedin } from "lucide-react";
import QuantityInput from "@/components/QuantityInput";
import StepBar from "@/components/StepBar";
import { useContentConfig } from "@/contexts/ContentConfigContext";

const ImageConfigPanel = dynamic(() => import("./ImageConfig"), {
  loading: () => (
    <div className="flex items-center justify-center py-12 glass-card-static border-dashed">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  ),
});

const CarouselPreview = dynamic(() => import("./CarouselPreview"), {
  loading: () => (
    <div className="flex items-center justify-center py-12 glass-card-static border-dashed">
      <Loader2 className="animate-spin text-accent" size={32} />
    </div>
  ),
});

export default function HomeClient() {
  const {
    niche,
    topics,
    selectedTopic,
    carouselData,
    images,
    showConfig,
    isGeneratingTopics,
    isGeneratingText,
    isGeneratingImages,
    setNiche,
    handleGenerateTopics,
    handleSelectTopic,
    handleGenerateImages,
  } = useCarouselWorkflow();
  const {
    platform,
    theme,
    objective,
    language,
    slides,
    setPlatform,
    setTheme,
    setObjective,
    setLanguage,
    setSlides,
  } = useContentConfig();

  return (
    <>
      {/* Search */}
      <form
        onSubmit={handleGenerateTopics}
        className="max-w-2xl mx-auto mb-12 animate-reveal animate-reveal-delay-1"
      >
        <div className="rounded-xl  p-6 max-w-xl mx-auto">
          <StepBar currentStep={1} />
        </div>
        <div className="rounded-xl bg-gray-800/50 border border-white/10 p-6 max-w-xl mx-auto">
          <div className="mt-1  gap-4">
            <p className="flex justify-start items-center text-base text-gray-300 font-bold">
              1. Plataforma de postagem
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ExclusiveCheckbox
              label="Instagram"
              value="instagram"
              selectedValue={platform}
              onChange={setPlatform}
              layout="card"
              icon={<Instagram size={22} />}
              description="Otimizado para carrossel"
            />

            <ExclusiveCheckbox
              label="LinkedIn"
              value="linkedin"
              selectedValue={platform}
              onChange={setPlatform}
              layout="card"
              icon={<Linkedin size={22} />}
              description="Formato mais profissional"
            />
          </div>

          <div className="mt-6  gap-4">
            <p className="flex justify-start items-center text-base text-gray-300 font-bold">
              2. Tema
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ExclusiveCheckbox
              label="Gerado pela IA"
              value="AIGenerated"
              selectedValue={theme}
              onChange={setTheme}
              layout="card"
              description="Segestão de tema alinhado ao seu nicho, gerado pela IA"
            />

            <ExclusiveCheckbox
              label="Livre"
              value="free"
              selectedValue={theme}
              onChange={setTheme}
              layout="card"
              description="Tema da sua escolha e conteúdo gerado pela IA"
            />
          </div>
          <div className="mt-6  gap-4">
            <p className="flex justify-start items-center text-base text-gray-300 font-bold">
              3. Objetivo da postagem
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
            <ExclusiveCheckbox
              label="Comercial"
              value="commercial"
              selectedValue={objective}
              onChange={setObjective}
              layout="card"
            />

            <ExclusiveCheckbox
              label="Informativo"
              value="informative"
              selectedValue={objective}
              onChange={setObjective}
              layout="card"
            />
            <ExclusiveCheckbox
              label="Autoridade"
              value="authority"
              selectedValue={objective}
              onChange={setObjective}
              layout="card"
            />
            <ExclusiveCheckbox
              label="Engajamento"
              value="engagement"
              selectedValue={objective}
              onChange={setObjective}
              layout="card"
            />
          </div>

          <div className="mt-6  gap-4">
            <p className="flex justify-start items-center text-base text-gray-300 font-bold">
              4. Idioma da postagem
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ExclusiveCheckbox
              label="Português"
              value="portugueseBR"
              selectedValue={language}
              onChange={setLanguage}
              layout="card"
            />

            <ExclusiveCheckbox
              label="Inglês"
              value="english"
              selectedValue={language}
              onChange={setLanguage}
              layout="card"
            />
            <ExclusiveCheckbox
              label="Espanhol"
              value="spanish"
              selectedValue={language}
              onChange={setLanguage}
              layout="card"
            />
          </div>
          <div className="mt-6  gap-4">
            <p className="flex justify-start items-center text-base text-gray-300 font-bold">
              5. Quantidade de Imagens
            </p>
          </div>
          <div className="mt-6">
            <QuantityInput
              min={1}
              max={15}
              defaultValue={slides}
              onChange={setSlides}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <input
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="Ex: Dicas de Design, Fitness para iniciantes…"
            name="niche"
            autoComplete="off"
            aria-label="Seu nicho de conteúdo"
            className="input-glow flex-1 px-5 py-3.5 rounded-xl text-base bg-card border-default text-[var(--color-text)] font-body min-h-12"
            required
          />
          <button
            type="submit"
            disabled={isGeneratingTopics || !niche.trim()}
            aria-label="Gerar temas em alta para seu nicho"
            className="btn-glow cursor-pointer px-7 py-3.5 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-primary font-display min-h-12"
          >
            {isGeneratingTopics ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Sparkles size={18} />
                Gerar 15 Temas em Alta
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading: gerando texto */}
      {isGeneratingText && (
        <LoadingCard
          message="Gerando texto dos slides e legenda…"
          color="primary"
        />
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
        <LoadingCard
          message="Criando suas 5 imagens com IA. Isso pode levar alguns segundos…"
          color="accent"
        />
      )}

      {/* Preview do Carrossel */}
      {!isGeneratingImages && carouselData && selectedTopic && images && (
        <CarouselPreview
          data={carouselData}
          topic={selectedTopic}
          images={images}
        />
      )}

      {/* Lista de Temas */}
      {!carouselData && !isGeneratingText && (
        <TopicList
          topics={topics}
          onSelect={handleSelectTopic}
          isLoadingCarousel={isGeneratingText}
        />
      )}
    </>
  );
}
