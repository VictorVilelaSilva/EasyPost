'use client';

import { useState } from 'react';
import { Sparkles, Upload, MonitorSmartphone, Terminal, Eye, Leaf } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalTemplate {
    id: string;
    title: string;
    description: string;
    tag: string;
    preview: string;
    previewContent: ReactNode;
}

const NATUREZA_PREVIEW_SLIDES: ModalTemplate[] = [
    {
        id: 'natureza',
        title: 'Natureza — Capa',
        description: 'Slide de abertura do carrossel',
        tag: 'Natureza',
        preview: 'bg-[#f0ece0]',
        previewContent: <img src="/templates/natureza/capa/capa.png" alt="Capa" className="w-full h-full object-cover" />,
    },
    {
        id: 'natureza',
        title: 'Natureza — Conteúdo',
        description: 'Slides intermediários de conteúdo',
        tag: 'Natureza',
        preview: 'bg-[#f0ece0]',
        previewContent: <img src="/templates/natureza/conteudo/conteudo.png" alt="Conteúdo" className="w-full h-full object-cover" />,
    },
    {
        id: 'natureza',
        title: 'Natureza — Final',
        description: 'Slide de encerramento com chamada para ação',
        tag: 'Natureza',
        preview: 'bg-[#f0ece0]',
        previewContent: <img src="/templates/natureza/final/final.png" alt="Final" className="w-full h-full object-cover" />,
    },
];
import TemplatePreviewModal from './TemplatePreviewModal';

const VISUAL_STYLES = [
    {
        id: 'natureza',
        title: 'Natureza',
        description: 'Design editorial com paleta creme e tipografia verde musgo. Elegante e atemporal.',
        icon: Leaf,
        tag: 'Editorial',
        preview: 'bg-[#f0ece0]',
        previewContent: (
            <img src="/templates/natureza/capa/capa.png" alt="Template Natureza" className="w-full h-full object-cover" />
        ),
        fullContent: (
            <img src="/templates/natureza/capa/capa.png" alt="Template Natureza" className="w-full h-full object-cover" />
        ),
    },
    {
        id: 'tech-start',
        title: 'Tech Start',
        description: 'Design minimalista focado em métricas e conversão.',
        icon: MonitorSmartphone,
        tag: 'Tech',
        preview: 'bg-slate-900',
        previewContent: (
            <>
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/20 to-purple-600/20 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <MonitorSmartphone className="w-16 h-16 text-[#a855f7]/30" />
                </div>
            </>
        ),
        fullContent: (
            <div className="flex flex-col h-full bg-slate-900 justify-center items-center font-sans text-center px-4">
                <h1 className="text-4xl md:text-5xl text-white font-bold mb-4 tracking-tight">Tech Start</h1>
                <p className="text-slate-400 max-w-sm mb-12">Boost your metrics using our conversion-focused design templates.</p>
                <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4 mx-auto">
                        <MonitorSmartphone className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="h-4 w-3/4 bg-white/10 rounded mx-auto mb-2"></div>
                    <div className="h-4 w-1/2 bg-white/10 rounded mx-auto"></div>
                </div>
            </div>
        )
    },
    {
        id: 'developer-pro',
        title: 'Developer Pro',
        description: 'Inspirado em editores de código modernos e temas dark.',
        icon: Terminal,
        tag: 'Dev',
        preview: 'bg-slate-900',
        previewContent: (
            <>
                <div className="absolute inset-0 bg-linear-to-tr from-blue-500/10 to-cyan-400/10 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Terminal className="w-16 h-16 text-slate-700" />
                </div>
            </>
        ),
        fullContent: (
            <div className="flex flex-col h-full bg-[#0d1117] p-8 font-mono text-left relative overflow-hidden">
                <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <p className="text-green-400 mb-2">➜  ~ ./create_project</p>
                    <p className="text-cyan-400 mb-8">Initializing new environment...</p>
                    <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">Code like a Pro</h1>
                    <p className="text-slate-500 border-l-2 border-slate-700 pl-4">Dark themes to save your eyes.</p>
                </div>
                <div className="absolute bottom-0 right-0 p-8 opacity-10">
                    <Terminal className="w-64 h-64 text-white" />
                </div>
            </div>
        )
    }
];

interface Props {
    onGenerate: (selectedStyle: string) => void;
    isLoading: boolean;
    onBack?: () => void;
}

export default function VisualStyleGallery({ onGenerate, isLoading, onBack }: Props) {
    const [selectedStyle, setSelectedStyle] = useState('tech-start');
    const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
    const [previewModalTemplates, setPreviewModalTemplates] = useState<ModalTemplate[]>([]);

    const handlePreview = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (id === 'natureza') {
            setPreviewModalTemplates(NATUREZA_PREVIEW_SLIDES);
        } else {
            setPreviewModalTemplates(VISUAL_STYLES.map(s => ({
                id: s.id,
                title: s.title,
                description: s.description,
                tag: s.tag,
                preview: s.preview,
                previewContent: s.fullContent,
            })));
        }
        setPreviewTemplateId(id);
    };



    return (
        <div className="w-full animate-reveal relative p-2 md:p-8" style={{ fontFamily: 'var(--font-display)' }}>

            <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-2">
                    {/* Botão Especial: Gerar com IA */}
                    <div
                        onClick={() => setSelectedStyle('ai-generated')}
                        className={`flex flex-col h-[320px] md:h-[420px] rounded-xl border-2 transition-all cursor-pointer items-center justify-center text-center p-8 group relative overflow-hidden ${selectedStyle === 'ai-generated' ? 'border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.3)] bg-[#a855f7]/5' : 'border-[#a855f7]/40 bg-linear-to-br from-[#a855f7]/10 via-transparent to-transparent hover:border-[#a855f7]'}`}
                    >
                        <div className="absolute inset-0 bg-[#a855f7]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 w-20 h-20 rounded-full bg-[#a855f7] flex items-center justify-center mb-6 shadow-xl shadow-[#a855f7]/40 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="relative z-10 text-xl font-bold text-white mb-3">Gerar estilo com IA</h3>
                        <p className="relative z-10 text-slate-400 text-sm leading-relaxed">Nossa inteligência criará um design exclusivo e autoral para sua marca.</p>

                        {selectedStyle === 'ai-generated' && (
                            <div className="absolute top-4 right-4 z-20">
                                <div className="bg-[#a855f7] text-white rounded-full p-1 shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Botão Especial: Upload */}
                    <div
                        onClick={() => setSelectedStyle('upload')}
                        className={`flex flex-col h-[320px] md:h-[420px] rounded-xl border border-dashed transition-all cursor-pointer items-center justify-center text-center p-8 group relative ${selectedStyle === 'upload' ? 'border-[#a855f7] bg-[#a855f7]/5' : 'border-white/20 hover:border-[#a855f7]/50 hover:bg-[#a855f7]/2'}`}
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#a855f7]/10 transition-colors">
                            <Upload className={`w-8 h-8 ${selectedStyle === 'upload' ? 'text-[#a855f7]' : 'text-slate-500 group-hover:text-[#a855f7]'}`} />
                        </div>
                        <h3 className={`text-xl font-bold mb-3 ${selectedStyle === 'upload' ? 'text-[#a855f7]' : 'text-slate-300 group-hover:text-[#a855f7]'}`}>Enviar meu próprio</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">Arraste seus assets visuais ou clique para fazer upload.</p>

                        {selectedStyle === 'upload' && (
                            <div className="absolute top-4 right-4 z-20">
                                <div className="bg-[#a855f7] text-white rounded-full p-1 shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Templates Regulares */}
                    {VISUAL_STYLES.map((style) => {
                        const isSelected = selectedStyle === style.id;
                        return (
                            <div
                                key={style.id}
                                onClick={() => setSelectedStyle(style.id)}
                                className={`flex flex-col h-[320px] md:h-[420px] rounded-xl glass-card overflow-hidden cursor-pointer relative group transition-all duration-300 ${isSelected ? 'ring-2 ring-[#a855f7] bg-white/5' : ''}`}
                            >
                                {isSelected && (
                                    <div className="absolute top-4 right-4 z-20">
                                        <div className="bg-[#a855f7] text-white rounded-full p-1 shadow-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                        </div>
                                    </div>
                                )}
                                <div className={`h-40 md:h-64 w-full relative overflow-hidden ${style.preview}`}>
                                    {style.previewContent}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                        <button
                                            onClick={(e) => handlePreview(e, style.id)}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-[#a855f7] hover:border-[#a855f7] transition-all text-sm font-bold text-white shadow-xl"
                                        >
                                            <Eye className="w-5 h-5" />
                                            <span>Ver Preview</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-center border-t border-white/5 bg-[#1e1525]">
                                    <h3 className="text-xl font-bold text-white mb-2">{style.title}</h3>
                                    <p className="text-slate-400 text-sm line-clamp-2">{style.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="w-full flex justify-between items-center border-t border-white/10 pt-8 mt-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center justify-center rounded-xl h-12 px-6 bg-transparent text-slate-400 hover:text-white text-base font-bold transition-colors cursor-pointer"
                >
                    Voltar
                </button>
                <button
                    type="button"
                    onClick={() => onGenerate(selectedStyle)}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 rounded-xl h-12 px-8 bg-[#7f0df2] hover:bg-[#922cee] disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-bold shadow-[0_0_20px_rgba(127,13,242,0.4)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                    {isLoading ? 'Gerando...' : 'Próximo Passo'}
                    {!isLoading && <Sparkles size={18} />}
                </button>
            </div>

            <TemplatePreviewModal
                isOpen={!!previewTemplateId}
                onClose={() => setPreviewTemplateId(null)}
                templates={previewModalTemplates}
                initialTemplateId={previewTemplateId}
                onSelect={(id) => setSelectedStyle(id)}
            />
        </div>
    );
}

