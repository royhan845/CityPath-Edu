"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { MapControls, OrbitControls, Grid as DreiGrid, Sky } from "@react-three/drei"
import PathfindingGrid from "./Grid"
import { BUILDINGS } from "../config/constants"

export default function Scene() {
    const [algorithm, setAlgorithm] = useState("dijkstra")
    const [triggerRun, setTriggerRun] = useState(false)

    const [clearPathTrigger, setClearPathTrigger] = useState(false)
    const [clearBoardTrigger, setClearBoardTrigger] = useState(false)

    const [drawMode, setDrawMode] = useState("start")
    const [rotationStep, setRotationStep] = useState(0)

    const [isExpanded, setIsExpanded] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    const [stats, setStats] = useState<{ visited: number, path: number } | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    const handleVisualize = () => { setTriggerRun(true); setTimeout(() => setTriggerRun(false), 1000); }
    const handleClearPath = () => { setClearPathTrigger(true); setStats(null); setTimeout(() => setClearPathTrigger(false), 100); }
    const handleClearBoard = () => { setClearBoardTrigger(true); setStats(null); setTimeout(() => setClearBoardTrigger(false), 100); }

    const algorithmDetails: Record<string, { title: string, desc: string, icon: string, color: string }> = {
        astar: { 
            title: "A* Search", 
            icon: "⭐", 
            color: "text-emerald-400", 
            desc: "A* adalah algoritma paling cerdas. Ia menggunakan 'insting' (heuristik) untuk menebak arah target, sehingga ia tidak perlu mengecek jalan buntu jika tidak terpaksa." 
        },
        greedy: { 
            title: "Greedy Best-First", 
            icon: "🏃‍♂️", color: "text-yellow-400", 
            desc: "Greedy sangat 'bernafsu' mengejar target. Ia sangat cepat, tapi kelemahannya ia sering terjebak di jalan buntu (bentuk U) karena tidak memikirkan gambaran rute secara keseluruhan." 
        },
        dijkstra: { 
            title: "Dijkstra", 
            icon: "🌊", 
            color: "text-cyan-400", 
            desc: "Dijkstra bekerja seperti gelombang air, menyebar ke segala arah secara merata. Ia pasti menemukan jalur terpendek, tapi sangat lambat karena ia mengecek semua area tanpa tahu di mana targetnya." 
        },
        bfs: { 
            title: "Breadth-First", 
            icon: "⭕", 
            color: "text-blue-400", 
            desc: "BFS mirip dengan Dijkstra pada grid tanpa bobot. Ia mengecek tetangga lapis demi lapis. Sangat andal, tapi kurang efisien untuk peta yang luas." 
        },
        dfs: { 
            title: "Depth-First", 
            icon: "⛏️", 
            color: "text-rose-400", 
            desc: "DFS berjalan seperti orang tersesat di labirin: ia menyusuri satu lorong sedalam-dalamnya sampai mentok, lalu putar balik. Sangat buruk untuk mencari rute tercepat." 
        }
    };

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

    return (
        <div className="relative h-screen w-full bg-slate-900 overflow-hidden font-sans">
            
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
                        <span className="text-xs text-slate-500 group-hover:text-emerald-400 font-bold transition-colors">
                            {isExpanded ? '▼ HIDE' : '▶ SHOW'}
                        </span>
                    </div>
                </button>
                
                <div className={`flex flex-col gap-5 p-5 pt-2 overflow-y-auto hide-scrollbar transition-opacity duration-300 ${!isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-100'}`}>
                    
                    {/* BAGIAN 1: INFORMASI SIMULASI */}
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
                    </div>

                    {/* BAGIAN 2: TOOLBAR */}
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

                    {/* BAGIAN 3: KATALOG */}
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

                    {/* BAGIAN 4: RESET */}
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

            <Canvas camera={{ position: isMobile ? [0, 15, 30] : [0, 15, 30], fov: isMobile ? 55 : 25 }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[10, 20, 10]} intensity={2} />
                {isMobile ? (
                    <OrbitControls makeDefault minDistance={10} maxDistance={70} maxPolarAngle={Math.PI / 2.1} />
                ) : (
                    <MapControls makeDefault minDistance={10} maxDistance={70} panSpeed={1.5} />
                )}
                <DreiGrid position={[0, -0.11, 0]} infiniteGrid sectionSize={1} sectionColor="#334155" cellColor="#475569" />
                <Sky sunPosition={[100, 20, 100]} />
                <Suspense fallback={null}>
                    <PathfindingGrid 
                        triggerRun={triggerRun} 
                        algorithm={algorithm} 
                        clearPathTrigger={clearPathTrigger} 
                        clearBoardTrigger={clearBoardTrigger} 
                        drawMode={drawMode} 
                        rotationStep={rotationStep} 
                        isMobile={isMobile} 
                        onFinishAnimation={(visited, path) => setStats({ visited, path })}
                    />
                </Suspense>
            </Canvas>

            <div className={`absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm transition-all duration-500 ${stats ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-500 delay-100 ${stats ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'}`}>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-4xl">{algorithmDetails[algorithm]?.icon}</span>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">Laporan Analisis</h2>
                            <p className={`text-sm font-bold ${algorithmDetails[algorithm]?.color}`}>{algorithmDetails[algorithm]?.title}</p>
                        </div>
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed mb-8">
                        {algorithmDetails[algorithm]?.desc}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl text-center">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Blok Diperiksa</p>
                            <p className="text-3xl font-black text-cyan-400">{stats?.visited} <span className="text-sm font-medium text-cyan-400/50">blok</span></p>
                            <p className="text-[10px] text-slate-500 mt-1">Area yang dieksplorasi</p>
                        </div>
                        <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl text-center">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Jarak Tempuh</p>
                            <p className="text-3xl font-black text-emerald-400">{stats?.path} <span className="text-sm font-medium text-emerald-400/50">langkah</span></p>
                            <p className="text-[10px] text-slate-500 mt-1">Panjang rute optimal</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => setStats(null)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95 border border-slate-600"
                    >
                        Tutup & Coba Algoritma Lain
                    </button>
                </div>
            </div>
        </div>
    )
}