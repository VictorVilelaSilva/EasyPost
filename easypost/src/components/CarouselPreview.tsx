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
            alert('Failed to download zip');
        }
        setIsDownloading(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(data.caption);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full mt-12 bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white">Your Carousel is Ready 🎉</h2>
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    <Download size={18} />
                    {isDownloading ? 'Zipping...' : 'Download Package'}
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {images.map((base64Image, i) => (
                    <div key={i} className="aspect-square bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={base64Image}
                            alt={`AI Generated Slide ${i + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                ))}
            </div>

            <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 relative">
                <button
                    onClick={copyToClipboard}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    title="Copy Caption"
                >
                    {copied ? <CheckCircle2 className="text-green-400" size={20} /> : <Copy size={20} />}
                </button>
                <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">Instagram Caption</h3>
                <p className="text-slate-200 whitespace-pre-wrap pr-8">{data.caption}</p>
            </div>
        </div>
    );
}
