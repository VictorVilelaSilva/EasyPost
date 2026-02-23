'use client';

interface Props {
    topics: string[];
    onSelect: (topic: string) => void;
    isLoadingCarousel: boolean;
}

export default function TopicList({ topics, onSelect, isLoadingCarousel }: Props) {
    if (topics.length === 0) return null;

    return (
        <div className="w-full mt-8">
            <h2 className="text-xl font-semibold mb-4 text-slate-100">Pick a Topic to Generate</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics.map((topic, i) => (
                    <button
                        key={i}
                        onClick={() => onSelect(topic)}
                        disabled={isLoadingCarousel}
                        className="text-left p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                        <span className="text-slate-200">{topic}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
