"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { MapControls, OrbitControls, Grid as DreiGrid, Sky, GizmoHelper, GizmoViewport } from "@react-three/drei"
import PathfindingGrid from "./Grid"
import { BUILDINGS } from "../config/constants"
import TemplateSelector from "./TemplateSelector"

interface SceneProps {
    templateId?: string;
}

export default function Scene({ templateId: initialTemplate = 'empty' }: SceneProps) {
    const [algorithm, setAlgorithm] = useState("dijkstra")
    const [triggerRun, setTriggerRun] = useState(false)

    const [clearPathTrigger, setClearPathTrigger] = useState(false)
    const [clearBoardTrigger, setClearBoardTrigger] = useState(false)

    const [drawMode, setDrawMode] = useState("start")
    const [rotationStep, setRotationStep] = useState(0)

    const [templateId, setTemplateId] = useState(initialTemplate);

    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [stats, setStats] = useState<{visited: number, path: number, time: number} | null>(null);
    const [history, setHistory] = useState<{algo: string, visited: number, path: number, time: number}[]>([]);
    const [liveText, setLiveText] = useState<string>("");

    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);

    const tutorialSlides = [
        {
            title: "Konfigurasi Environment",
            desc: "Gunakan instrumen 'Klik Gedung' dan 'Katalog' di panel kiri untuk mendesain topologi rintangan. Semakin kompleks kotamu, semakin menantang untuk algoritmanya!",
            video: "./video/Konfigurasi Environment.mp4"
        },
        {
            title: "Penempatan Entitas",
            desc: "Pilih instrumen 'Titik Awal' (Karakter) atau 'Titik Tujuan' (Target), lalu klik di area tanah kosong untuk memindahkan mereka ke posisi yang strategis.",
            video: "./video/tutorial-2.mp4"
        },
        {
            title: "Analisis Algoritma",
            desc: "Pilih metode algoritma dari menu dropdown, lalu eksekusi. Kamu bisa membandingkan mana algoritma yang paling efisien dalam memecahkan labirin buatanmu.",
            video: "./video/tutorial-3.mp4"
        }
    ];

    const algorithmDetails: Record<string, { title: string, desc: string, icon: string, color: string }> = {
        astar: { title: "A* Search", icon: "⭐", color: "text-emerald-400", desc: "A* adalah algoritma heuristik paling optimal. Ia mengevaluasi jarak tempuh dan menebak arah target, sehingga sangat efisien tanpa harus mengecek area yang tidak relevan." },
        greedy: { title: "Greedy Best-First", icon: "🏃‍♂️", color: "text-yellow-400", desc: "Greedy secara agresif memprioritaskan area yang paling dekat dengan target. Sangat cepat, namun rawan terjebak pada jalan buntu (bentuk U) karena kurangnya evaluasi rute menyeluruh." },
        dijkstra: { title: "Dijkstra", icon: "🌊", color: "text-cyan-400", desc: "Dijkstra menjamin penemuan rute terpendek dengan mengekspansi area secara radial (merata ke segala arah). Tingkat akurasinya absolut, namun komputasinya lambat pada peta terbuka." },
        bfs: { title: "Breadth-First", icon: "⭕", color: "text-blue-400", desc: "BFS menelusuri grid lapis demi lapis layaknya riak air. Sangat andal untuk peta tanpa bobot jarak, namun kurang optimal untuk topologi yang luas." },
        dfs: { title: "Depth-First", icon: "⛏️", color: "text-rose-400", desc: "DFS mengeksplorasi satu percabangan sedalam-dalamnya secara membabi buta sebelum mundur (backtracking). Sangat tidak disarankan untuk pencarian rute terpendek." }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowTutorial(true);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            const onWheel = (e: WheelEvent) => {
                if (e.deltaY === 0) return;
                e.preventDefault();
                el.scrollTo({ left: el.scrollLeft + e.deltaY * 2, behavior: "smooth" });
            };
            el.addEventListener("wheel", onWheel);
            return () => el.removeEventListener("wheel", onWheel);
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r') setRotationStep((prev) => (prev + 1) % 4)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleVisualize = () => {
        if (isMobile) {
            setIsExpanded(false);
        }
        setTriggerRun(true); 
        setTimeout(() => setTriggerRun(false), 1000); 
    }

    const handleClearPath = () => { 
        setClearPathTrigger(true); 
        setStats(null); 
        setTimeout(() => setClearPathTrigger(false), 100); 
    }

    const handleClearBoard = () => { 
        setClearBoardTrigger(true); 
        setStats(null); 
        setHistory([]);
        setTimeout(() => setClearBoardTrigger(false), 100); 
    }

    const closeTutorial = () => {
        setShowTutorial(false);
    }

    return (
        <div className="relative h-[100dvh] w-full bg-slate-900 overflow-hidden font-sans">
            
            {/* --- UI RESPONSIVE PANEL --- */}
            <div className={`absolute z-10 flex flex-col bg-slate-900/95 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-slate-700 text-white transition-all duration-500 ease-in-out
                bottom-0 left-0 right-0 rounded-t-3xl border-t 
                ${isExpanded ? 'max-h-[65vh]' : 'max-h-[50px]'}
                md:top-4 md:bottom-auto md:left-4 md:right-auto md:w-[340px] md:rounded-2xl md:border md:shadow-2xl
                ${isExpanded ? 'md:max-h-[calc(100vh-2rem)]' : 'md:max-h-[50px]'}
            `}>
                
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full h-[50px] flex items-center justify-center group cursor-pointer shrink-0"
                >
                    <div className="flex flex-col items-center w-full md:hidden">
                        <div className="w-12 h-1.5 bg-slate-700 group-hover:bg-slate-500 rounded-full mb-1 transition-colors"></div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {isExpanded ? 'Tap to Hide' : 'Tap to Show'}
                        </div>
                    </div>
                    
                    <div className="hidden md:flex items-center justify-between w-full px-5 h-full border-b border-transparent group-hover:border-slate-800 transition-colors">
                        <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                            City Editor v1.0
                        </span>
                        <div className="flex items-center gap-4">
                            <span 
                                onClick={(e) => { e.stopPropagation(); setTutorialStep(0); setShowTutorial(true); }}
                                className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 transition-colors"
                            >
                                📖 Panduan
                            </span>
                            <span className="text-xs text-slate-500 group-hover:text-emerald-400 font-bold transition-colors">
                                {isExpanded ? '▼ HIDE' : '▶'}
                            </span>
                        </div>
                    </div>
                </button>
                
                <div className={`flex flex-col gap-5 p-5 pt-2 overflow-y-auto hide-scrollbar transition-opacity duration-300 ${!isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-100'}`}>
                    
                    <div className="flex flex-col gap-3">
                        <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hidden md:block">
                            Simulasi Pathfinding
                        </h1>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                            Analisis bagaimana berbagai algoritma menavigasi rintangan spasial untuk menemukan jalur komputasi paling efisien dari <span className="text-emerald-400 font-bold">Titik Awal</span> ke <span className="text-rose-400 font-bold">Tujuan</span>.
                        </p>
                        
                        <select className="bg-slate-800 text-xs font-bold border border-slate-600 rounded-xl px-3 py-3 outline-none focus:border-emerald-500 transition-all cursor-pointer" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                            <option value="astar">A* Search (Heuristik, Optimal)</option>
                            <option value="greedy">Greedy Best-First (Heuristik, Cepat)</option>
                            <option value="dijkstra">Dijkstra (Eksplorasi Menyeluruh)</option>
                            <option value="bfs">Breadth-First Search (Eksplorasi Level)</option>
                            <option value="dfs">Depth-First Search (Eksplorasi Dalam)</option>
                        </select>
                        
                        <button onClick={handleVisualize} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95 border border-emerald-400 flex justify-center items-center">
                            Eksekusi Algoritma
                        </button>

                        <TemplateSelector onSelectTemplate={(id) => {
                            setTemplateId(id);
                        }} />
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t border-slate-800">
                        <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Instrumen Kontrol</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setDrawMode("select")} className={`py-3 px-2 text-xs font-bold rounded-xl transition-all border ${drawMode === 'select' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                                Pilih Objek
                            </button>
                            <button onClick={() => setDrawMode("start")} className={`py-3 px-2 text-xs font-bold rounded-xl transition-all border ${drawMode === 'start' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                                Titik Awal
                            </button>
                            <button onClick={() => setDrawMode("end")} className={`py-3 px-2 text-xs font-bold rounded-xl transition-all border ${drawMode === 'end' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                                Titik Tujuan
                            </button>
                            <button onClick={() => setDrawMode("delete")} className={`py-3 px-2 text-xs font-bold rounded-xl transition-all border ${drawMode === 'delete' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                                Hapus Objek
                            </button>
                        </div>
                        <button onClick={() => setRotationStep((prev) => (prev + 1) % 4)} className="w-full py-3.5 text-sm font-bold rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition-all active:scale-95 flex items-center justify-center shadow-md border border-indigo-400">
                            Rotasi Objek (R)
                        </button>
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-slate-800">
                        <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase px-1">Katalog Environment</label>
                        <div ref={scrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar pt-2 pb-4 px-2 cursor-grab active:cursor-grabbing select-none">
                            {Object.entries(BUILDINGS).filter(([_, data]) => data.id >= 7).map(([key, data]) => (
                                <button key={key} onClick={() => setDrawMode(key)} className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 group ${drawMode === key ? 'border-emerald-400 scale-[1.10] translate-y-1 shadow-[0_0_15px_rgba(52,211,153,0.3)] z-10 mx-1' : 'border-slate-700 opacity-60 hover:opacity-100'}`}>
                                    <img src={data.image} alt={data.name} className="w-full h-full object-cover bg-slate-800 pointer-events-none" />
                                    <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] md:text-[10px] py-1 text-center font-mono text-slate-300 font-bold">{data.sizeX}x{data.sizeZ}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
                        <button 
                            onClick={handleClearPath} 
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3.5 rounded-xl border border-slate-600 transition-all active:scale-95 flex justify-center items-center"
                        >
                            Reset Parameter State
                        </button>
                        <button 
                            onClick={handleClearBoard} 
                            className="w-full bg-slate-900 hover:bg-rose-950 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 text-xs font-bold py-3.5 rounded-xl transition-all active:scale-95 flex justify-center items-center"
                        >
                            Bersihkan Environment
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MODAL TUTORIAL / ONBOARDING --- */}
            <div className={`absolute inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md transition-all duration-500 ${showTutorial ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`bg-slate-900 border border-slate-700 p-6 md:p-8 rounded-3xl shadow-2xl max-w-lg w-full transform transition-all duration-500 delay-100 ${showTutorial ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'}`}>
                    
                    <div className="flex justify-center gap-2 mb-6">
                        {tutorialSlides.map((_, idx) => (
                            <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${tutorialStep === idx ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-700'}`}></div>
                        ))}
                    </div>

                    <div className="w-full aspect-video bg-slate-800 rounded-2xl mb-6 overflow-hidden border border-slate-700 flex items-center justify-center relative">
                        <video 
                            src={tutorialSlides[tutorialStep].video}
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="w-full h-full object-cover relative z-10"
                            onError={(e) => e.currentTarget.style.display = 'none'} 
                        />
                    </div>

                    <div className="min-h-[100px]">
                        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{tutorialSlides[tutorialStep].title}</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">{tutorialSlides[tutorialStep].desc}</p>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button 
                            onClick={() => setTutorialStep(prev => Math.max(0, prev - 1))}
                            className={`flex-1 py-3.5 rounded-xl font-bold transition-all border ${tutorialStep === 0 ? 'opacity-0 pointer-events-none' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'}`}
                        >
                            Sebelumnya
                        </button>
                        
                        {tutorialStep < tutorialSlides.length - 1 ? (
                            <button 
                                onClick={() => setTutorialStep(prev => prev + 1)}
                                className="flex-1 py-3.5 rounded-xl font-bold transition-all bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-400 shadow-lg active:scale-95"
                            >
                                Selanjutnya
                            </button>
                        ) : (
                            <button 
                                onClick={closeTutorial}
                                className="flex-1 py-3.5 rounded-xl font-bold transition-all bg-cyan-500 hover:bg-cyan-600 text-white border border-cyan-400 shadow-lg active:scale-95 flex items-center justify-center gap-2"
                            >
                                Mulai Eksplorasi
                            </button>
                        )}
                    </div>
                    
                    <button 
                        onClick={closeTutorial}
                        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        title="Tutup Tutorial"
                    >
                        ✖
                    </button>
                </div>
            </div>

            {/* --- LIVE ACTION LOG (SUBTITLES) DENGAN PROGRESS BAR --- */}
            <div className={`absolute bottom-12 left-1/2 transform -translate-x-1/2 transition-all duration-500 z-[100] pointer-events-none ${liveText && !stats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="bg-slate-900/90 border border-emerald-500/50 px-6 py-4 rounded-3xl shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-md min-w-[320px]">
                    <div className="flex items-center gap-4 mb-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <p className="text-sm font-bold text-emerald-400 tracking-wide">
                            {liveText}
                        </p>
                    </div>
                    
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300 ease-out"
                            style={{ 
                                width: liveText.includes("Memulai") ? "10%" : 
                                    liveText.includes("Scanning") ? "40%" : 
                                    liveText.includes("Target") ? "75%" : 
                                    liveText.includes("Rute") ? "95%" : "0%" 
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* --- PANEL LEGENDA EDUKATIF --- */}
            <div className="absolute top-20 right-4 z-40 hidden md:flex flex-col gap-2 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-xl">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Informasi Visual</h3>
                
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs text-slate-300 font-medium">Titik Awal (Source)</span>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                    <span className="text-xs text-slate-300 font-medium">Target (Destination)</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm bg-sky-400 opacity-60"></div>
                    <span className="text-xs text-slate-300 font-medium">Visited (Closed Set)</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                    <span className="text-xs text-slate-300 font-medium">Shortest Path (Optimal)</span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm bg-white shadow-[0_0_10px_#fff]"></div>
                    <span className="text-xs text-white font-bold italic">Active Scanner</span>
                </div>
            </div>

            {/* --- MODAL LAPORAN EDUKASI & PERBANDINGAN --- */}
            <div className={`absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm transition-all duration-500 ${stats ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-500 delay-100 ${stats ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'} max-h-[90vh] overflow-y-auto hide-scrollbar`}>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-4xl">{algorithmDetails[algorithm]?.icon}</span>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Hasil Eksekusi</h2>
                            <p className={`text-sm font-bold ${algorithmDetails[algorithm]?.color}`}>{algorithmDetails[algorithm]?.title}</p>
                        </div>
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                        {algorithmDetails[algorithm]?.desc}
                    </p>

                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-2xl text-center flex flex-col justify-center">
                            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Diperiksa</p>
                            <p className="text-xl font-black text-cyan-400">{stats?.visited}</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">Blok</p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-2xl text-center flex flex-col justify-center">
                            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Rute</p>
                            <p className="text-xl font-black text-emerald-400">{stats?.path}</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">Langkah</p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/50 p-3 rounded-2xl text-center flex flex-col justify-center">
                            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Waktu</p>
                            <p className="text-xl font-black text-amber-400">
                                {stats?.time && stats.time < 0.01 ? "< 0.01" : stats?.time.toFixed(2)}
                            </p>
                            <p className="text-[9px] text-slate-500 mt-0.5">Milidetik</p>
                        </div>
                    </div>

                    <div className="mb-6 bg-slate-800/80 border border-slate-600 p-4 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">💡 Ringkasan Analisis</h4>
                        <div className="text-sm text-slate-400 leading-relaxed font-medium">
                            {history.length <= 1 ? (
                                "Ini adalah eksekusi pertamamu pada labirin ini. Coba tutup jendela ini, pilih algoritma lain, dan sistem akan membandingkan performanya secara otomatis!"
                            ) : (
                                (() => {
                                    if (history.length === 0) return null;

                                    const bestVisitedAlgo = [...history].sort((a, b) => a.visited - b.visited)[0];
                                    const fastestAlgo = [...history].sort((a, b) => a.time - b.time)[0];
                                    const current = history[history.length - 1];

                                    let summary = [];

                                    summary.push(
                                        <span key="global-eff" className="block mb-2">
                                            🏆 <b>Efisiensi Tertinggi:</b> Secara matematis, <b>{algorithmDetails[bestVisitedAlgo.algo]?.title}</b> adalah yang paling hemat memori dengan hanya memeriksa <b>{bestVisitedAlgo.visited} blok</b>.
                                        </span>
                                    );

                                    summary.push(
                                        <span key="global-speed" className="block mb-2">
                                            ⚡ <b>Kecepatan Tertinggi:</b> Dalam hal komputasi murni, <b>{algorithmDetails[fastestAlgo.algo]?.title}</b> memegang rekor tercepat dengan waktu <b>{fastestAlgo.time < 0.01 ? "< 0.01" : fastestAlgo.time.toFixed(2)} ms</b>.
                                        </span>
                                    );

                                    if (history.length > 1) {
                                        summary.push(
                                            <div key="current-analysis" className="mt-3 pt-3 border-t border-slate-700/50 italic text-[13px]">
                                                {current.algo === bestVisitedAlgo.algo 
                                                    ? `✅ Percobaan terakhir (${algorithmDetails[current.algo]?.title}) berhasil mempertahankan posisi sebagai yang paling efisien.`
                                                    : `ℹ️ Percobaan terakhir (${algorithmDetails[current.algo]?.title}) membutuhkan ${current.visited - bestVisitedAlgo.visited} blok lebih banyak dibandingkan rekor terbaik.`
                                                }
                                            </div>
                                        );
                                    }

                                    return summary;
                                })()
                            )}
                        </div>
                    </div>

                    {history.length > 1 && (
                        <div className="mb-8 border border-slate-700 rounded-2xl overflow-hidden bg-slate-800/30 shadow-inner">
                            <div className="bg-slate-800 py-2.5 px-4 border-b border-slate-700 grid grid-cols-12 gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-wider items-center text-center">
                                <div className="col-span-5 text-left">Algoritma</div>
                                <div className="col-span-2" title="Blok yang dievaluasi">Blok</div>
                                <div className="col-span-2" title="Langkah rute">Rute</div>
                                <div className="col-span-3 text-right" title="Waktu Eksekusi">Waktu (ms)</div>
                            </div>
                            
                            <div className="p-2 space-y-1 text-xs">
                                {history.map((item, idx) => (
                                    <div key={idx} className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl font-medium transition-colors ${idx === history.length - 1 ? 'bg-slate-700/80 border border-slate-500 shadow-sm' : 'text-slate-400 hover:bg-slate-800/50'}`}>
                                        
                                        <div className="col-span-5 flex items-center gap-2 text-left overflow-hidden">
                                            <span className="w-3 text-center opacity-50 text-[10px]">{idx + 1}.</span>
                                            <span className={`${idx === history.length - 1 ? algorithmDetails[item.algo]?.color : 'text-slate-300'} font-bold truncate`}>
                                                {algorithmDetails[item.algo]?.title}
                                            </span>
                                        </div>
                                        
                                        <div className={`col-span-2 text-center ${idx === history.length - 1 ? 'text-cyan-400' : ''}`}>
                                            {item.visited}
                                        </div>
                                        
                                        <div className={`col-span-2 text-center ${idx === history.length - 1 ? 'text-emerald-400' : ''}`}>
                                            {item.path}
                                        </div>
                                        
                                        <div className={`col-span-3 text-right font-mono text-[11px] ${idx === history.length - 1 ? 'text-amber-400' : 'text-slate-500'}`}>
                                            {item.time < 0.01 ? "< 0.01" : item.time.toFixed(2)}
                                        </div>
                                        
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => {
                            setStats(null);
                            handleClearPath(); 
                        }}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95 border border-slate-600"
                    >
                        Tutup & Uji Algoritma Lain
                    </button>
                </div>
            </div>

            <Canvas dpr={[1, 1.5]}  camera={{ position: isMobile ? [0, 15, 30] : [0, 15, 30], fov: isMobile ? 55 : 25 }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 20, 10]} intensity={2} />
                
                {isMobile ? (
                    <OrbitControls makeDefault minDistance={10} maxDistance={70} maxPolarAngle={Math.PI / 2.1} />
                ) : (
                    <MapControls makeDefault minDistance={10} maxDistance={70} panSpeed={1.5} />
                )}

                <DreiGrid position={[0, -0.11, 0]} infiniteGrid sectionSize={1} sectionColor="#334155" cellColor="#475569" />
                <Sky sunPosition={[100, 20, 100]} />

                <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                    <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
                </GizmoHelper>

                <Suspense fallback={null}>
                    <PathfindingGrid 
                        triggerRun={triggerRun} 
                        algorithm={algorithm} 
                        clearPathTrigger={clearPathTrigger} 
                        clearBoardTrigger={clearBoardTrigger} 
                        drawMode={drawMode} 
                        setDrawMode={setDrawMode}
                        rotationStep={rotationStep} 
                        isMobile={isMobile} 
                        templateId={templateId}
                        onStepUpdate={(text) => setLiveText(text)}
                        onFinishAnimation={(visited, path, time) => {
                            setStats({ visited, path, time });
                            setLiveText("");
                            setHistory(prev => {
                                const lastEntry = prev[prev.length - 1];
                                if (lastEntry && lastEntry.algo === algorithm && lastEntry.visited === visited) return prev;
                                return [...prev, { algo: algorithm, visited, path, time }];
                            });
                        }}
                    />
                </Suspense>
            </Canvas>
        </div>
    )
}