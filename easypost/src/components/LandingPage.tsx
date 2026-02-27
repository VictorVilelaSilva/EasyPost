'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from './Logo';
import Image from 'next/image';

export default function LandingPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/create');
        }
    }, [user, loading, router]);

    if (loading || user) {
        return <div className="min-h-screen bg-black" />;
    }

    return (
        <div className="bg-[#000000] text-slate-200 font-['Spline_Sans'] selection:bg-[#A855F7]/30 min-h-screen relative z-10">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700;800&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
                
                .landing-gradient-mesh {
                    background-color: #000000;
                    background-image: 
                        radial-gradient(at 0% 0%, rgba(168, 85, 247, 0.12) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, rgba(124, 58, 237, 0.12) 0px, transparent 50%);
                }
                .sticky-nav {
                    backdrop-filter: blur(16px);
                    background-color: rgba(0, 0, 0, 0.75);
                }
                .dotted-pattern {
                    background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
                    background-size: 24px 24px;
                }
            `}</style>

            <nav className="sticky-nav fixed top-0 w-full z-50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo />
                    </div>
                    <div className="hidden md:flex items-center gap-10">
                        <a className="text-sm font-medium text-slate-400 hover:text-[#A855F7] transition-colors" href="#">Features</a>
                        <a className="text-sm font-medium text-slate-400 hover:text-[#A855F7] transition-colors" href="#">Showcase</a>
                        <a className="text-sm font-medium text-slate-400 hover:text-[#A855F7] transition-colors" href="#">Pricing</a>
                        <a className="text-sm font-medium text-slate-400 hover:text-[#A855F7] transition-colors" href="#">Resources</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white px-4 py-2">Log in</button>
                        <button className="bg-[#A855F7] hover:bg-[#A855F7]/90 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#A855F7]/25">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            <main className="landing-gradient-mesh pt-20 min-h-screen">
                <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A855F7]/10 border border-[#A855F7]/20 text-[#A855F7] text-xs font-bold uppercase tracking-wider">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A855F7] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A855F7]"></span>
                            </span>
                            AI-Powered Visuals
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] text-white">
                            Transform your <span className="text-[#A855F7]">social presence</span> with AI magic.
                        </h1>
                        <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                            Create stunning, high-converting visual stories for Instagram and LinkedIn in seconds. The power of a full design studio, simplified for creators.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <div className="relative flex-1 max-w-md">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
                                <input className="w-full bg-[#0F0F0F] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-[#A855F7] focus:border-transparent transition-all" placeholder="Enter your work email" type="email" />
                            </div>
                            <button className="bg-[#A855F7] text-white px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-[#A855F7]/20">
                                Start Creating
                            </button>
                        </div>
                        <div className="flex items-center gap-6 pt-4 text-slate-500">
                            <div className="flex -space-x-3">
                                <Image className="w-10 h-10 rounded-full border-2 border-[#000000]" alt="User avatar 1" src="/stitch_assets/avatar1.jpg" width={40} height={40} />
                                <Image className="w-10 h-10 rounded-full border-2 border-[#000000]" alt="User avatar 2" src="/stitch_assets/avatar2.jpg" width={40} height={40} />
                                <Image className="w-10 h-10 rounded-full border-2 border-[#000000]" alt="User avatar 3" src="/stitch_assets/avatar3.jpg" width={40} height={40} />
                            </div>
                            <span className="text-sm font-medium">Joined by 10,000+ top creators</span>
                        </div>
                    </div>
                    <div className="relative group z-10">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#A855F7]/30 to-[#7C3AED]/30 blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                        <div className="relative bg-[#0F0F0F]/60 border border-white/10 p-8 rounded-[2rem] shadow-2xl backdrop-blur-md">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center p-6 border border-white/5">
                                    <span className="material-symbols-outlined text-6xl text-slate-500">photo_library</span>
                                </div>
                                <div className="aspect-square bg-[#A855F7]/15 rounded-2xl flex items-center justify-center p-6 border border-[#A855F7]/20 relative overflow-hidden">
                                    <span className="material-symbols-outlined text-6xl text-[#A855F7] relative z-10">auto_awesome</span>
                                    <div className="absolute inset-0 bg-[#A855F7]/5 animate-pulse"></div>
                                </div>
                                <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center p-6 border border-white/5">
                                    <span className="material-symbols-outlined text-6xl text-slate-500">share</span>
                                </div>
                                <div className="aspect-square bg-[#7C3AED]/15 rounded-2xl flex items-center justify-center p-6 border border-[#7C3AED]/20">
                                    <span className="material-symbols-outlined text-6xl text-[#7C3AED]">insights</span>
                                </div>
                            </div>
                            <div className="absolute -top-6 -right-6 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-[#A855F7]/50 border">
                                <span className="material-symbols-outlined text-[#A855F7] text-3xl font-bold">star</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 space-y-32 relative z-10">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Visuals that drive results</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            Stop guessing how your posts will look. Our immersive mockup engine shows you exactly what your audience sees before you hit publish.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="grid lg:grid-cols-12 gap-12 items-center">
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="w-12 h-12 bg-[#A855F7]/10 border border-[#A855F7]/20 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#A855F7]">photo_camera</span>
                                    </div>
                                    <h3 className="text-4xl font-bold text-white">Instagram Stories</h3>
                                    <p className="text-slate-400 text-lg">
                                        Create full-screen immersive layouts that stop the scroll. AI-suggested stickers, layouts, and typography optimized for engagement.
                                    </p>
                                    <ul className="space-y-4 pt-4">
                                        <li className="flex items-center gap-3 text-slate-300 font-medium">
                                            <span className="material-symbols-outlined text-[#A855F7]">check_circle</span>
                                            AI Layout Optimization
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300 font-medium">
                                            <span className="material-symbols-outlined text-[#A855F7]">check_circle</span>
                                            One-click color matching
                                        </li>
                                    </ul>
                                </div>
                                <div className="lg:col-span-7">
                                    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0F0F0F] group">
                                        <div className="bg-center bg-no-repeat aspect-[16/9] bg-cover transition-transform duration-700 group-hover:scale-105 opacity-90" style={{ backgroundImage: 'url("/stitch_assets/mockup1.jpg")' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative bg-[#0F0F0F]/50 py-24">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="grid lg:grid-cols-12 gap-12 items-center">
                                <div className="lg:col-span-7 order-2 lg:order-1">
                                    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0F0F0F] group">
                                        <div className="bg-center bg-no-repeat aspect-[16/9] bg-cover transition-transform duration-700 group-hover:scale-105 opacity-90" style={{ backgroundImage: 'url("/stitch_assets/mockup2.jpg")' }}></div>
                                    </div>
                                </div>
                                <div className="lg:col-span-5 space-y-6 order-1 lg:order-2">
                                    <div className="w-12 h-12 bg-[#A855F7]/10 border border-[#A855F7]/20 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#A855F7]">view_carousel</span>
                                    </div>
                                    <h3 className="text-4xl font-bold text-white">LinkedIn Carousels</h3>
                                    <p className="text-slate-400 text-lg">
                                        Professional slide decks that establish authority. Convert your articles or long-form posts into high-impact visual carousels.
                                    </p>
                                    <ul className="space-y-4 pt-4">
                                        <li className="flex items-center gap-3 text-slate-300 font-medium">
                                            <span className="material-symbols-outlined text-[#A855F7]">check_circle</span>
                                            Automated slide generation
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300 font-medium">
                                            <span className="material-symbols-outlined text-[#A855F7]">check_circle</span>
                                            Corporate brand kit sync
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative pb-24">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="grid lg:grid-cols-12 gap-12 items-center">
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="w-12 h-12 bg-[#A855F7]/10 border border-[#A855F7]/20 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#A855F7]">image</span>
                                    </div>
                                    <h3 className="text-4xl font-bold text-white">Twitter Visuals</h3>
                                    <p className="text-slate-400 text-lg">
                                        Viral-ready graphics for your threads. Make your text stand out with auto-generated visual summaries that boost CTR.
                                    </p>
                                    <ul className="space-y-4 pt-4">
                                        <li className="flex items-center gap-3 text-slate-300 font-medium">
                                            <span className="material-symbols-outlined text-[#A855F7]">check_circle</span>
                                            Thread-to-graphic conversion
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-300 font-medium">
                                            <span className="material-symbols-outlined text-[#A855F7]">check_circle</span>
                                            Instant mobile preview
                                        </li>
                                    </ul>
                                </div>
                                <div className="lg:col-span-7">
                                    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0F0F0F] group">
                                        <div className="bg-center bg-no-repeat aspect-[16/9] bg-cover transition-transform duration-700 group-hover:scale-105 opacity-90" style={{ backgroundImage: 'url("/stitch_assets/mockup3.jpg")' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                    <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#1E0B36] via-[#2D1150] to-[#1E0B36] p-12 lg:p-24 text-center border border-white/5">
                        <div className="absolute inset-0 dotted-pattern opacity-40"></div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#A855F7]/10 via-transparent to-[#7C3AED]/10"></div>
                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">Ready to tell your <br />brand&apos;s visual story?</h2>
                            <p className="text-slate-300 text-lg lg:text-xl max-w-2xl mx-auto font-medium">
                                Join 10,000+ creators who are using EasyPost to scale their social content without scaling their workload.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                                <button className="bg-[#A855F7] text-white px-10 py-5 rounded-2xl font-bold text-xl hover:brightness-110 transition-all shadow-2xl shadow-[#A855F7]/40">
                                    Get Started for Free
                                </button>
                                <button className="bg-white/5 backdrop-blur-xl border border-white/10 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all">
                                    View Live Demo
                                </button>
                            </div>
                            <p className="text-white/50 text-sm font-medium">No credit card required • 14-day free trial</p>
                        </div>
                    </div>
                </section>

                <footer className="border-t border-white/5 py-12 bg-black relative z-10">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
                        <div className="col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <Logo />
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                                The ultimate AI workspace for social media creators and marketing teams.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Features</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Integrations</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Templates</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">About Us</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Careers</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Blog</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Help Center</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">API Docs</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Community</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Privacy Policy</a></li>
                                <li><a className="hover:text-[#A855F7] transition-colors" href="#">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-slate-500 text-sm">© 2024 EasyPost AI. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a className="text-slate-500 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
                            <a className="text-slate-500 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
                            <a className="text-slate-500 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
