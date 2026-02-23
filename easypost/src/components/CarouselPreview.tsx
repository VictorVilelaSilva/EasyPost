'use client';

import { useState } from 'react';
import { CarouselData } from '../types';
import { downloadCarouselZip } from '../lib/downloadZip';
import { Download, Copy, CheckCircle2 } from 'lucide-react';

interface Props {
    data: CarouselData | null;
    topic: string;
    images: string[];
}

export default function CarouselPreview({ data, topic, images }: Props) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!data || !images) return null;

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await downloadCarouselZip(topic, data, images);
        } catch (e) {
            console.error(e);
            alert('Falha ao baixar o pacote');
        }
        setIsDownloading(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(data.caption);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full mt-12 glass-card-static p-6 animate-reveal">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                    Seu Carrossel está Pronto
                </h2>
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    aria-label="Baixar pacote do carrossel"
                    className="btn-glow cursor-pointer flex items-center gap-2 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                        fontFamily: 'var(--font-display)',
                        minHeight: '44px',
                    }}
                >
                    <Download size={18} />
                    {isDownloading ? 'Compactando...' : 'Baixar Pacote'}
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8 stagger-children">
                {images.map((base64Image, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden shadow-lg animate-fade-in" style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={base64Image}
                            alt={`Slide ${i + 1} gerado por IA`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                ))}
            </div>

            <div className="glass-card-static p-5 relative">
                <button
                    onClick={copyToClipboard}
                    className="cursor-pointer absolute top-4 right-4 transition-colors"
                    style={{ color: copied ? '#34d399' : 'var(--color-text-muted)' }}
                    aria-label="Copiar legenda"
                >
                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
                <h3 className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-subtle)', fontFamily: 'var(--font-display)' }}>
                    Legenda do Instagram
                </h3>
                <p className="whitespace-pre-wrap pr-8 text-sm leading-relaxed" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
                    {data.caption}
                </p>
            </div>
        </div>
    );
}
