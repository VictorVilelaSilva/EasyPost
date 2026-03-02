"use client";

import dynamic from "next/dynamic";
import { Loader2, Sparkles } from "lucide-react";
import TopicList from "./TopicList";
import LoadingCard from "./LoadingCard";
import { useCarouselWorkflow } from "../hooks/useCarouselWorkflow";
import ExclusiveCheckbox from "@/components/ExclusiveCheckbox";
import TextInput from "@/components/TextInput";
import { Instagram, Linkedin } from "lucide-react";
import { useState } from "react";

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

  const [platform, setPlatform] = useState("instagram");
  const [theme, setTheme] = useState("AIGenerated");
  const [objective, setObjective] = useState("commercial");
  const [language, setLanguage] = useState("portugueseBR");
  const [slides, setSlides] = useState("");

  return (
    <>
      {/* Search */}
      <form
        onSubmit={handleGenerateTopics}
        className="max-w-2xl mx-auto mb-12 animate-reveal animate-reveal-delay-1"
      >
        <div className="rounded-xl bg-gray-800/50 border border-white/10 p-6 max-w-xl mx-auto">
          <h2 className="text-lg font-semibold text-white">
            Configurações do conteúdo
          </h2>

          <div className="mt-4 flex items-center gap-4">
            <p className="text-sm text-gray-300">Plataforma de postagem</p>

            <ExclusiveCheckbox
              label="Instagram"
              value="instagram"
              icon={<Instagram size={18} />}
              selectedValue={platform}
              onChange={setPlatform}
            />

            <ExclusiveCheckbox
              label="LinkedIn"
              value="linkedin"
              icon={<Linkedin size={18} />}
              selectedValue={platform}
              onChange={setPlatform}
            />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <p className="text-sm text-gray-300">Tema</p>

            <ExclusiveCheckbox
              label="Gerado pela IA"
              value="AIGenerated"
              selectedValue={theme}
              onChange={setTheme}
            />

            <ExclusiveCheckbox
              label="Livre"
              value="free"
              selectedValue={theme}
              onChange={setTheme}
            />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <p className="text-sm text-gray-300">Objetivo</p>

            <ExclusiveCheckbox
              label="Comercial"
              value="commercial"
              selectedValue={objective}
              onChange={setObjective}
            />

            <ExclusiveCheckbox
              label="Informativo"
              value="informative"
              selectedValue={objective}
              onChange={setObjective}
            />

            <ExclusiveCheckbox
              label="Autoridade"
              value="authority"
              selectedValue={objective}
              onChange={setObjective}
            />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <p className="text-sm text-gray-300">Linguagem do post</p>

            <ExclusiveCheckbox
              label="Português"
              value="portugueseBR"
              selectedValue={language}
              onChange={setLanguage}
            />

            <ExclusiveCheckbox
              label="Inglês"
              value="english"
              selectedValue={language}
              onChange={setLanguage}
            />

            <ExclusiveCheckbox
              label="Espanhol"
              value="spanish"
              selectedValue={language}
              onChange={setLanguage}
            />
          </div>
          <div className="flex items-center gap-3 mt-5">
            <span className="text-sm text-gray-300 whitespace-nowrap">
              Quantidade de Slides
            </span>

            <div className="w-20">
              <TextInput type="number" value={slides} onChange={setSlides} />
            </div>
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
