"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Cpu, Route, Network, Scan, Map, Car, Bot, Gamepad2, TerminalSquare, Activity, ChevronRight } from "lucide-react"
import Scene from "../src/components/scene/Scene" // Sesuaikan path import jika berbeda
import TerminalBoot from "../src/components/ui/TerminalBoot"
import MiniLiveVisualization from "../src/components/panels/MiniLiveVisualization"
import HologramShowcase from "../src/components/scene/HologramShowcase"

// --- GLOBAL CSS ANIMATIONS ---
const CustomStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
        @keyframes movingGrid {
            0% { background-position: 0 0; }
            100% { background-position: 40px 40px; }
        }
        .animate-moving-grid { animation: movingGrid 15s linear infinite; }
        @keyframes scanline {
            0% { transform: translateY(-100vh); }
            100% { transform: translateY(100vh); }
        }
        .animate-scanline { animation: scanline 8s linear infinite; }
        .glass-panel {
            background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255,255,255,0.05);
            box-shadow: 0 0 30px rgba(34, 211, 238, 0.05), inset 0 1px 0 rgba(255,255,255,0.1);
        }
    `}} />
);

// --- REUSABLE CINEMATIC REVEAL WRAPPER ---
const FadeUp = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
        className={className}
    >
        {children}
    </motion.div>
);

export default function Home() {
    const [isSimulating, setIsSimulating] = useState(false);
    const [isBooting, setIsBooting] = useState(false);
    const [sceneMode, setSceneMode] = useState<'tutorial' | 'report'>('tutorial');

    useEffect(() => {
        if (isSimulating || isBooting) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
    }, [isSimulating, isBooting]);

    const handleLaunch = (mode: 'tutorial' | 'report') => {
        setSceneMode(mode);
        setIsBooting(true);
    };

    if (isBooting) return <TerminalBoot onComplete={() => { setIsBooting(false); setIsSimulating(true); }} />;

    if (isSimulating) {
        return (
            <div className="fixed inset-0 w-full h-[100dvh] animate-in zoom-in-95 fade-in duration-700 bg-[#060816] z-50">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none flex flex-col items-center">
                    <div className="glass-panel px-5 py-2 rounded-full font-mono text-[10px] tracking-widest text-[#22D3EE] uppercase flex items-center gap-2">
                        <Activity size={12} className="animate-pulse" /> Live Simulation Environment
                    </div>
                </div>
                
                <button 
                    onClick={() => setIsSimulating(false)}
                    className="group absolute top-6 right-6 z-[100] glass-panel hover:bg-rose-950/20 hover:border-rose-500/30 hover:shadow-[0_0_20px_rgba(244,63,94,0.1)] text-slate-400 hover:text-rose-400 px-5 py-2.5 rounded-[4px] font-mono text-[10px] transition-all duration-300 flex items-center gap-2 uppercase tracking-widest"
                >
                    <TerminalSquare size={14} /> Terminate
                </button>
                
                {/* Prop initialMode sekarang ditangkap oleh Scene */}
                <Scene initialMode={sceneMode} />
            </div>
        )
    }

    return (
        <div className="w-full h-[100dvh] overflow-y-auto snap-y snap-mandatory bg-[#060816] text-slate-300 font-sans selection:bg-[#22D3EE]/30 scroll-smooth relative">
            <CustomStyles />

            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.4] animate-moving-grid"
                    style={{
                        backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.08) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
                    }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.04),transparent_60%)] animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#22D3EE]/20 to-transparent opacity-50 animate-scanline" />
            </div>

            <header className="fixed top-0 z-[100] w-full glass-panel !border-x-0 !border-t-0 py-4 px-6 lg:px-10 flex justify-between items-center transition-all">
                <div className="font-black text-xl text-slate-100 flex items-center gap-3 tracking-tighter">
                    <img src="/images/icon-dark.svg" alt="Icon" className="w-5 h-5 brightness-0 invert opacity-90 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    <div className="drop-shadow-md">CityPath<span className="text-slate-500 font-medium">Edu</span></div>
                </div>
                <nav className="hidden md:flex gap-12 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                    <a href="#how-it-works" className="hover:text-[#22D3EE] hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all flex items-center gap-1.5"><Cpu size={12} /> Matrix</a>
                    <a href="#algorithms" className="hover:text-[#22D3EE] hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all flex items-center gap-1.5"><Network size={12} /> Engines</a>
                    <a href="#benefits" className="hover:text-[#22D3EE] hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all flex items-center gap-1.5"><Map size={12} /> Context</a>
                </nav>
                <button onClick={() => handleLaunch('tutorial')} className="text-[#22D3EE] hover:text-white border border-[#22D3EE]/30 hover:border-[#22D3EE] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] bg-[#22D3EE]/5 hover:bg-[#22D3EE]/20 px-6 py-2 rounded-[3px] font-mono text-[10px] uppercase tracking-widest transition-all active:scale-95">
                    Initialize System
                </button>
            </header>

            <main className="snap-start min-h-[100dvh] flex items-center justify-center relative pt-20 px-6 max-w-7xl mx-auto w-full z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16 w-full">
                    <FadeUp className="flex-1 space-y-7 text-center lg:text-left z-10">
                        <div className="inline-flex items-center gap-2 font-mono text-[9px] tracking-widest uppercase text-slate-400 mb-2 border border-slate-800 bg-[#0F172A]/50 px-3 py-1 rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                            <span className="w-1.5 h-1.5 bg-[#22D3EE] rounded-full animate-pulse shadow-[0_0_5px_#22D3EE]"></span> 
                            [ SYS_ACTIVE ] Hexagonal Navigation Grid
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold leading-[1.05] text-slate-100 tracking-tight max-w-3xl mx-auto lg:mx-0 drop-shadow-lg">
                            Visualizing <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] to-[#38BDF8] drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">Pathfinding Intelligence</span> <br />
                            In Real Time.
                        </h1>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0 font-mono border-l border-[#22D3EE]/30 pl-4 bg-gradient-to-r from-[#22D3EE]/5 to-transparent py-2">
                            A next-gen simulation environment. Construct spatial obstacles and observe how diverse computing engines evaluate optimal routes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-6">
                            <button onClick={() => handleLaunch('tutorial')} className="relative group bg-[#22D3EE] hover:bg-[#38BDF8] text-[#060816] font-bold px-8 py-3.5 rounded-[4px] transition-all active:scale-95 flex items-center justify-center gap-2 text-sm shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:shadow-[0_0_35px_rgba(34,211,238,0.5)]">
                                Enter Simulation <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 border border-white/40 rounded-[4px] pointer-events-none group-hover:scale-105 transition-transform duration-300 opacity-0 group-hover:opacity-100"></div>
                            </button>
                        </div>
                    </FadeUp>

                    <FadeUp delay={0.2} className="flex-1 w-full aspect-square max-w-[550px] relative flex items-center justify-center">
                        <motion.div 
                            animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-10 -left-6 z-20 glass-panel px-4 py-3 rounded-[4px] font-mono text-[8px] tracking-widest text-[#22D3EE] uppercase leading-relaxed"
                        >
                            CPU LOAD: <span className="text-slate-300">12.4%</span><br/>
                            CORE TEMP: <span className="text-slate-300">42°C</span><br/>
                            VRAM ALLOC: <span className="text-slate-300">1.2 GB</span>
                        </motion.div>
                        <motion.div 
                            animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-16 -right-6 z-20 glass-panel px-4 py-3 rounded-[4px] font-mono text-[8px] tracking-widest text-emerald-400 uppercase leading-relaxed text-right"
                        >
                            HEURISTIC: <span className="text-slate-300">SYNCED</span><br/>
                            MESH STATE: <span className="text-slate-300">VALID</span><br/>
                            FPS LOCK: <span className="text-slate-300">60.0</span>
                        </motion.div>
                        <div className="absolute inset-0 bg-[#22D3EE]/5 blur-[100px] rounded-full pointer-events-none"></div>
                        <div className="w-full h-full relative z-10 glass-panel rounded-full overflow-hidden p-4">
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-2 z-20 bg-[#060816]/80 px-3 py-1 rounded-full border border-white/5">
                                <Scan size={10} className="text-[#22D3EE]" /> Spatial Render Engine
                            </div>
                            <HologramShowcase />
                        </div>
                    </FadeUp>
                </div>
            </main>

            <section id="how-it-works" className="snap-start min-h-[100dvh] flex flex-col justify-center py-20 px-6 w-full relative z-10 border-y border-white/[0.02]">
                <div className="max-w-7xl mx-auto w-full">
                    <FadeUp className="text-center mb-16">
                        <div className="font-mono text-[10px] tracking-widest uppercase text-[#38BDF8] mb-4">[ MODULE_02 ] Simulation Pipeline</div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-100 tracking-tight drop-shadow-lg">Data Transformation Matrix.</h2>
                    </FadeUp>
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { step: "STAGE_01", icon: <Scan size={24} className="text-[#22D3EE] mb-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />, t: "Scan Environment", d: "Sistem mengonversi topologi 3D menjadi koordinat grid komputasi." },
                            { step: "STAGE_02", icon: <Network size={24} className="text-[#22D3EE] mb-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />, t: "Generate Graph", d: "Koordinat diubah menjadi Node interaktif dengan properti obstacle absolut." },
                            { step: "STAGE_03", icon: <Cpu size={24} className="text-[#22D3EE] mb-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />, t: "Compute Heuristics", d: "AI menghitung F, G, dan H cost untuk memprioritaskan probabilitas rute." },
                            { step: "STAGE_04", icon: <Route size={24} className="text-[#22D3EE] mb-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />, t: "Execute Path", d: "Rute final dirender menjadi visualisasi jalur bersinar pada viewport 3D." }
                        ].map((item, i) => (
                            <FadeUp key={i} delay={i * 0.1}>
                                <div className="p-6 h-full glass-panel rounded-xl hover:-translate-y-2 transition-transform duration-300 text-left relative overflow-hidden group">
                                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#22D3EE]/10 blur-2xl group-hover:bg-[#22D3EE]/20 transition-colors" />
                                    <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-slate-600 group-hover:text-[#22D3EE] transition-colors tracking-widest">{item.step}</div>
                                    {item.icon}
                                    <h3 className="text-base font-bold text-slate-200 mb-2 drop-shadow-sm">{item.t}</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed font-mono">{item.d}</p>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            <section id="algorithms" className="snap-start min-h-[100dvh] flex flex-col justify-center py-20 px-6 max-w-7xl mx-auto w-full relative z-10">
                <div className="flex flex-col lg:flex-row gap-16 items-center w-full">
                    <FadeUp className="flex-1 w-full">
                        <div className="font-mono text-[10px] tracking-widest uppercase text-[#38BDF8] mb-4">[ MODULE_03 ] Analytical Engine</div>
                        <h2 className="text-4xl lg:text-5xl font-bold text-slate-100 tracking-tight mb-6 leading-[1.1] drop-shadow-md">Core Algorithm Mechanics.</h2>
                        <p className="text-slate-400 mb-10 leading-relaxed font-mono text-sm border-l border-[#22D3EE]/30 pl-4">
                            Setiap metode memiliki karakteristik alokasi memori dan prioritas node yang unik. Pahami perbedaannya sebelum mengeksekusi simulasi 3D.
                        </p>
                        <div className="space-y-3 font-mono text-xs">
                            {[
                                { name: "A* Search", badge: "Balanced", desc: "Menggunakan tebakan arah (Heuristik). Optimal dan hemat resource memori." },
                                { name: "Dijkstra", badge: "Accurate", desc: "Menyebar radial tanpa heuristik. Menjamin rute terpendek absolut." },
                                { name: "Greedy BFS", badge: "Fast", desc: "Eksplorasi agresif menuju target. Cepat, namun rentan pada obstacle kompleks." }
                            ].map((a, i) => (
                                <div key={i} className="flex flex-col p-5 glass-panel rounded-lg hover:border-[#22D3EE]/30 transition-colors group cursor-default">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-slate-200 group-hover:text-[#22D3EE] transition-colors">{a.name}</span>
                                        <span className="text-[9px] text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/20 px-2 py-1 uppercase tracking-widest rounded-sm shadow-[0_0_8px_rgba(34,211,238,0.1)]">{a.badge}</span>
                                    </div>
                                    <p className="text-slate-500 leading-relaxed">{a.desc}</p>
                                </div>
                            ))}
                        </div>
                    </FadeUp>
                    <FadeUp delay={0.2} className="flex-1 w-full p-8 glass-panel rounded-2xl flex flex-col relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
                        <MiniLiveVisualization />
                        <div className="border-t border-white/5 pt-6 mt-4 relative z-10 text-center">
                            <h3 className="text-sm font-bold text-slate-200 mb-2 font-mono uppercase tracking-widest">Data Telemetry Export</h3>
                            <p className="text-[10px] text-slate-500 mb-6 max-w-sm mx-auto font-mono uppercase leading-relaxed">
                                Extract live variables: Exploration nodes, comp_time (ms), and path length directly from the simulator.
                            </p>
                            <button onClick={() => handleLaunch('report')} className="group font-mono text-[10px] text-white uppercase tracking-widest border border-[#22D3EE]/50 bg-[#22D3EE]/10 hover:bg-[#22D3EE] hover:text-[#060816] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] px-8 py-3 rounded-[3px] transition-all cursor-pointer pointer-events-auto">
                                Run Comparison Matrix ↗
                            </button>
                        </div>
                    </FadeUp>
                </div>
            </section>

            <section id="benefits" className="snap-start min-h-[100dvh] flex flex-col justify-center py-20 px-6 border-y border-white/[0.02] bg-[#0F172A]/20 w-full relative z-10 overflow-hidden">
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#22D3EE]/5 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2"></div>
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center w-full z-10 relative">
                    <FadeUp>
                        <div className="font-mono text-[10px] tracking-widest uppercase text-[#38BDF8] mb-4">[ MODULE_04 ] Applied Autonomy</div>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] mb-6 text-slate-100 drop-shadow-lg">The Core of<br />Machine <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] to-white">Intelligence.</span></h2>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-md font-mono">
                            Pathfinding adalah instrumen krusial dalam rekayasa perangkat lunak modern. Memahaminya berarti menguasai logika di balik otonomi digital.
                        </p>
                    </FadeUp>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { i: <Bot className="text-[#22D3EE] mb-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={28}/>, t: "Robotics", d: "Navigasi presisi robot manufaktur & logistik." },
                            { i: <Gamepad2 className="text-[#22D3EE] mb-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={28}/>, t: "Game AI", d: "Penentuan vektor gerak NPC secara dinamis." },
                            { i: <Map className="text-[#22D3EE] mb-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={28}/>, t: "Routing System", d: "Kalkulasi topologi peta digital & traffic." },
                            { i: <Car className="text-[#22D3EE] mb-4 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={28}/>, t: "Self-Driving", d: "Komputasi ruang otonom penghindar tabrakan." }
                        ].map((b, idx) => (
                            <FadeUp key={idx} delay={idx * 0.1}>
                                <div className="p-6 glass-panel rounded-xl hover:border-[#22D3EE]/30 hover:bg-white/[0.04] transition-all group">
                                    <div className="group-hover:scale-110 transition-transform origin-left">{b.i}</div>
                                    <h4 className="font-mono text-[11px] uppercase tracking-widest font-bold text-slate-200 mb-2">{b.t}</h4>
                                    <p className="text-xs text-slate-500 font-mono leading-relaxed">{b.d}</p>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="snap-start min-h-[100dvh] flex flex-col justify-center py-20 px-8 bg-[#060816] w-full relative z-10 overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#22D3EE]/5 blur-[150px] pointer-events-none rounded-full" />
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 w-full relative z-10">
                    <div className="max-w-sm">
                        <div className="font-black text-3xl text-slate-100 flex items-center gap-3 tracking-tighter mb-4 drop-shadow-md">
                            <img src="/images/icon-dark.svg" alt="Logo" className="w-8 h-8 brightness-0 invert opacity-90 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                            <div>CityPath<span className="text-slate-600 font-medium">Edu</span></div>
                        </div>
                        <div className="text-[10px] text-[#22D3EE] font-mono tracking-widest uppercase mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#22D3EE] rounded-full animate-ping"></span> Simulation Environment
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed font-mono mb-6 border-l border-slate-800 pl-3">
                            Developed specifically to dissect spatial algorithms through interactive three-dimensional representation.
                        </p>
                    </div>
                    <div className="hidden lg:flex flex-1 flex-col justify-center pointer-events-none opacity-70 px-8">
                        <div className="font-mono text-[9px] text-slate-500 flex flex-col gap-1.5 leading-none">
                            <span className="text-[#22D3EE] drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"> SYSTEM CORE : ONLINE</span>
                            <span> MOUNTING 3D RENDERER... [OK]</span>
                            <span> FRAME RATE TARGET : 60 FPS</span>
                            <span> LATENCY : 12ms</span>
                            <span> AI MODULE : STANDBY</span>
                            <span> MEMORY ALLOCATION : 1.02 GB</span>
                            <span className="mt-2 text-slate-600">AWAITING USER INITIALIZATION...</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-16 min-w-[300px]">
                        <div>
                            <h5 className="text-slate-300 font-bold mb-4 uppercase font-mono text-[10px] tracking-widest border-b border-white/10 pb-2">Tech Stack</h5>
                            <ul className="text-[11px] font-mono text-slate-500 space-y-3">
                                <li>Next.js Framework</li>
                                <li>Three.js / React Fiber</li>
                                <li>Framer Motion</li>
                                <li>Tailwind Engine</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-slate-300 font-bold mb-4 uppercase font-mono text-[10px] tracking-widest border-b border-white/10 pb-2">Databases</h5>
                            <ul className="text-[11px] font-mono text-slate-500 space-y-3">
                                <li className="group hover:text-[#22D3EE] cursor-pointer transition-colors flex justify-between"><span>Source Git</span> <span className="opacity-0 group-hover:opacity-100">↗</span></li>
                                <li className="group hover:text-[#22D3EE] cursor-pointer transition-colors flex justify-between"><span>Alg Docs</span> <span className="opacity-0 group-hover:opacity-100">↗</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto w-full mt-24 pt-6 border-t border-white/5 text-[9px] text-slate-600 font-mono tracking-widest flex flex-col md:flex-row justify-between items-center gap-4">
                    <span>© {new Date().getFullYear()} ROYHAN FIRDAUS.</span>
                    <span className="text-slate-700">INFORMATICS RESEARCH PROJECT.</span>
                </div>
            </footer>
        </div>
    )
}