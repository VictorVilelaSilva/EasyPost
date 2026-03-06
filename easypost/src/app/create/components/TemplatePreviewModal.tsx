import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Template {
    id: string;
    title: string;
    description: string;
    tag: string;
    preview: string;
    previewContent: React.ReactNode;
}

interface TemplatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: Template | null;
    onSelect: (id: string) => void;
}

export default function TemplatePreviewModal({ isOpen, onClose, template, onSelect }: TemplatePreviewModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !template) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-300" onClick={onClose}>
            <div
                className="relative w-full max-w-[1200px] h-[90vh] max-h-[800px] bg-[#f7f5f8]/90 dark:bg-[#191022]/90 backdrop-blur-md rounded-xl border border-[#7f0df2]/20 shadow-2xl flex flex-col overflow-hidden z-50 animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
                style={{ fontFamily: 'var(--font-display)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#7f0df2]/10 bg-white/5">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {template.title}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            {template.description}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-[#7f0df2]/10 transition-colors text-slate-500 dark:text-slate-400 hover:text-[#7f0df2]"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body - Preview Area */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-linear-to-br from-[#f7f5f8] to-[#f7f5f8]/50 dark:from-[#191022] dark:to-[#7f0df2]/5">
                    <button className="absolute left-4 lg:left-8 z-20 p-4 rounded-full bg-[#7f0df2]/20 hover:bg-[#7f0df2] text-[#7f0df2] hover:text-white transition-all backdrop-blur-sm cursor-pointer">
                        <ChevronLeft size={32} />
                    </button>

                    <div className="relative w-full max-w-4xl h-[400px] md:h-[540px] flex items-center justify-center perspective-[1000px]">
                        {/* Slide Left (Background) */}
                        <div className="hidden md:flex absolute left-1/4 -translate-x-1/2 scale-75 opacity-60 z-10 w-[360px] h-[540px] bg-white dark:bg-[#2a2233] rounded-xl shadow-xl overflow-hidden transform -rotate-6 transition-all duration-500 border border-[#7f0df2]/10 flex-col">
                            <div className={`w-full flex-1 relative ${template.preview} overflow-hidden`}>
                                {template.previewContent}
                            </div>
                        </div>

                        {/* Slide Right (Background) */}
                        <div className="hidden md:flex absolute right-1/4 translate-x-1/2 scale-75 opacity-60 z-10 w-[360px] h-[540px] bg-white dark:bg-[#2a2233] rounded-xl shadow-xl overflow-hidden transform rotate-6 transition-all duration-500 border border-[#7f0df2]/10 flex-col">
                            <div className={`w-full flex-1 relative ${template.preview} overflow-hidden`}>
                                {template.previewContent}
                            </div>
                        </div>

                        {/* Slide Center (Foreground) */}
                        <div className="absolute z-30 w-[280px] h-[420px] md:w-[360px] md:h-[540px] bg-white dark:bg-[#2a2233] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden transform transition-all duration-500 border-2 border-[#7f0df2]/30 flex flex-col scale-[1.05]">
                            <div className={`w-full flex-1 relative ${template.preview} overflow-hidden`}>
                                {template.previewContent}
                            </div>
                        </div>
                    </div>

                    <button className="absolute right-4 lg:right-8 z-20 p-4 rounded-full bg-[#7f0df2]/20 hover:bg-[#7f0df2] text-[#7f0df2] hover:text-white transition-all backdrop-blur-sm">
                        <ChevronRight size={32} />
                    </button>

                    <div className="absolute bottom-8 z-20 flex gap-2">
                        <div className="w-8 h-2 rounded-full bg-[#7f0df2]"></div>
                        <div className="w-2 h-2 rounded-full bg-[#7f0df2]/30"></div>
                        <div className="w-2 h-2 rounded-full bg-[#7f0df2]/30"></div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#7f0df2]/10 bg-[#f7f5f8]/50 dark:bg-[#191022]/50 flex justify-center backdrop-blur-md">
                    <button
                        onClick={() => {
                            onSelect(template.id);
                            onClose();
                        }}
                        className="flex min-w-[200px] cursor-pointer items-center justify-center gap-2 rounded-lg h-12 px-8 bg-[#7f0df2] hover:bg-[#7f0df2]/90 text-white text-base font-bold transition-colors shadow-lg shadow-[#7f0df2]/30"
                    >
                        {/* Use lucide Style icon or generic equivalent */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 14 10 10 10-10-10-10Z" /><path d="m12 22 10-10" /><path d="m2 14 10-10" /></svg>
                        <span>Usar este Estilo</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
