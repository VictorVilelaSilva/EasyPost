'use client';

export default function SkeletonPreview() {
    return (
        <div className="w-full animate-fade-in flex flex-col items-center gap-6" style={{ fontFamily: 'var(--font-body)' }}>
            {/* Generic loading label */}
            <div className="flex items-center gap-3">
                <span
                    className="inline-block w-2 h-2 rounded-full bg-[#a855f7] animate-pulse"
                    style={{ boxShadow: '0 0 8px #a855f7' }}
                />
                <span className="text-sm font-medium" style={{ color: 'rgba(148,163,184,0.7)', letterSpacing: '0.05em' }}>
                    Gerando seu carrossel
                    <span className="inline-flex gap-0.5 ml-1">
                        {[0, 1, 2].map(i => (
                            <span
                                key={i}
                                className="inline-block w-1 h-1 rounded-full bg-slate-400"
                                style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                            />
                        ))}
                    </span>
                </span>
            </div>

            {/* Preview layout skeleton */}
            <div className="w-full flex gap-0 rounded-2xl overflow-hidden" style={{
                background: 'rgba(8,5,16,0.7)',
                border: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                maxWidth: '1100px',
                minHeight: '520px',
            }}>
                {/* Left area (back button area) */}
                <div className="w-16 flex items-start justify-center pt-6 shrink-0">
                    <div className="skeleton-shimmer w-8 h-8 rounded-full" />
                </div>

                {/* Center: phone mockup */}
                <div className="flex-1 flex flex-col items-center justify-center gap-5 py-10 px-4">
                    {/* Platform tabs */}
                    <div className="flex gap-4">
                        <div className="skeleton-shimmer h-5 w-16 rounded-full" />
                        <div className="skeleton-shimmer h-5 w-20 rounded-full" style={{ opacity: 0.5 }} />
                    </div>

                    {/* Phone frame */}
                    <div
                        className="relative rounded-[2rem] overflow-hidden"
                        style={{
                            width: '240px',
                            height: '380px',
                            background: 'rgba(15,10,25,0.9)',
                            border: '6px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 0 40px rgba(168,85,247,0.08)',
                        }}
                    >
                        {/* Phone top bar skeleton */}
                        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="skeleton-shimmer w-7 h-7 rounded-full" />
                            <div className="flex flex-col gap-1 flex-1">
                                <div className="skeleton-shimmer h-2.5 w-20 rounded" />
                                <div className="skeleton-shimmer h-2 w-14 rounded" style={{ opacity: 0.5 }} />
                            </div>
                            <div className="skeleton-shimmer w-4 h-4 rounded" style={{ opacity: 0.4 }} />
                        </div>

                        {/* Slide area */}
                        <div className="skeleton-shimmer w-full" style={{ height: '270px', borderRadius: 0 }} />

                        {/* Phone bottom bar */}
                        <div className="flex items-center justify-between px-5 py-3">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="skeleton-shimmer w-5 h-5 rounded-full" style={{ opacity: 0.4 }} />
                            ))}
                            <div className="skeleton-shimmer w-5 h-5 rounded-full" style={{ opacity: 0.4 }} />
                        </div>
                    </div>

                    {/* Navigation arrows */}
                    <div className="flex items-center gap-4">
                        <div className="skeleton-shimmer w-7 h-7 rounded-full" />
                        <div className="skeleton-shimmer h-3 w-10 rounded" style={{ opacity: 0.5 }} />
                        <div className="skeleton-shimmer w-7 h-7 rounded-full" />
                    </div>
                </div>

                {/* Right sidebar */}
                <div
                    className="w-64 shrink-0 flex flex-col gap-5 p-6"
                    style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
                >
                    {/* Title */}
                    <div className="flex flex-col gap-1">
                        <div className="skeleton-shimmer h-4 w-28 rounded" />
                        <div className="skeleton-shimmer h-3 w-16 rounded" style={{ opacity: 0.5 }} />
                    </div>

                    {/* Slide thumbnails */}
                    <div className="flex flex-col gap-3 mt-1">
                        <div className="skeleton-shimmer h-3 w-10 rounded" style={{ opacity: 0.4 }} />
                        {[0, 1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-2 rounded-lg"
                                style={{
                                    background: i === 0 ? 'rgba(168,85,247,0.08)' : 'transparent',
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            >
                                <div
                                    className="skeleton-shimmer rounded-md shrink-0"
                                    style={{ width: '36px', height: '36px', animationDelay: `${i * 0.15}s` }}
                                />
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <div className="skeleton-shimmer h-2.5 w-full rounded" style={{ animationDelay: `${i * 0.15}s` }} />
                                    <div className="skeleton-shimmer h-2 w-2/3 rounded" style={{ opacity: 0.5, animationDelay: `${i * 0.15}s` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Caption */}
                    <div className="flex flex-col gap-2 mt-auto">
                        <div className="skeleton-shimmer h-3 w-14 rounded" style={{ opacity: 0.4 }} />
                        <div className="skeleton-shimmer h-16 w-full rounded-lg" />
                    </div>

                    {/* Edit button */}
                    <div className="skeleton-shimmer h-10 w-full rounded-xl" style={{ opacity: 0.6 }} />
                </div>
            </div>
        </div>
    );
}
