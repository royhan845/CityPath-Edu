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
    const scrollRef = useRef<HTMLDivElement>(null);

    // Cek ukuran layar untuk mode Mobile/Desktop
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Scroll Horizontal Otomatis
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

    // Deteksi Keyboard R
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r') setRotationStep((prev) => (prev + 1) % 4)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleVisualize = () => { setTriggerRun(true); setTimeout(() => setTriggerRun(false), 1000); }
    const handleClearPath = () => { setClearPathTrigger(true); setTimeout(() => setClearPathTrigger(false), 100); }
    const handleClearBoard = () => { setClearBoardTrigger(true); setTimeout(() => setClearBoardTrigger(false), 100); }

    return (
        <div className="relative h-screen w-full bg-slate-900 overflow-hidden font-sans">
            
            {/* --- UI RESPONSIVE & COLLAPSIBLE --- */}
            <div className={`absolute z-10 flex flex-col bg-slate-900/95 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-slate-700 text-white transition-all duration-500 ease-in-out
                /* MOBILE (HP) */
                bottom-0 left-0 right-0 rounded-t-3xl border-t 
                ${isExpanded ? 'max-h-[55vh]' : 'max-h-[50px]'}
                /* DESKTOP (PC) */
                md:top-4 md:bottom-auto md:left-4 md:right-auto md:w-[320px] md:rounded-2xl md:border md:shadow-2xl
                ${isExpanded ? 'md:max-h-[calc(100vh-2rem)]' : 'md:max-h-[50px]'}
            `}>
                
                {/* --- HEADER / TOGGLE BUTTON --- */}
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full h-[50px] flex items-center justify-center group cursor-pointer shrink-0"
                >
                    {/* Visual Handle untuk HP */}
                    <div className="flex flex-col items-center w-full md:hidden">
                        <div className="w-12 h-1.5 bg-slate-700 group-hover:bg-slate-500 rounded-full mb-1 transition-colors"></div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {isExpanded ? 'Tap to Hide' : 'Tap to Show'}
                        </div>
                    </div>
                    
                    {/* Visual Header untuk PC */}
                    <div className="hidden md:flex items-center justify-between w-full px-5 h-full border-b border-transparent group-hover:border-slate-800 transition-colors">
                        <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                            <span>🛠️</span> City Editor v1.0
                        </span>
                        <span className="text-xs text-slate-500 group-hover:text-emerald-400 font-bold transition-colors">
                            {isExpanded ? '▼ HIDE' : '▶ SHOW'}
                        </span>
                    </div>
                </button>
                
                {/* --- KONTEN MENU --- */}
                <div className={`flex flex-col gap-5 p-5 pt-2 overflow-y-auto hide-scrollbar transition-opacity duration-300 ${!isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100 delay-100'}`}>
                    
                    <div className="flex flex-col gap-3">
                        <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hidden md:block">
                            City Pathfinding
                        </h1>
                        <select className="bg-slate-800 text-sm border border-slate-600 rounded-xl px-3 py-2.5 outline-none focus:border-emerald-500 transition-all" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                            <option value="dijkstra">Dijkstra's Algorithm</option>
                            <option value="astar">A* (A-Star) Search</option>
                            <option value="greedy">Greedy Best-First Search</option>
                            <option value="bfs">Breadth-First Search (BFS)</option>
                            <option value="dfs">Depth-First Search (DFS)</option>
                        </select>
                        <button onClick={handleVisualize} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 md:py-3 py-2.5 rounded-xl transition-all shadow-lg active:scale-95">
                            Visualize Path!
                        </button>
                    </div>

                    <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-800">
                        <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Peralatan</label>
                        <div className="grid grid-cols-4 gap-2">
                            <button onClick={() => setDrawMode("select")} className={`py-2 text-[10px] font-bold rounded-lg transition-all ${drawMode === 'select' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Pilih</button>
                            <button onClick={() => setDrawMode("start")} className={`py-2 text-[10px] font-bold rounded-lg transition-all ${drawMode === 'start' ? 'bg-green-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Mulai</button>
                            <button onClick={() => setDrawMode("end")} className={`py-2 text-[10px] font-bold rounded-lg transition-all ${drawMode === 'end' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Tujuan</button>
                            <button onClick={() => setDrawMode("delete")} className={`py-2 text-[10px] font-bold rounded-lg transition-all ${drawMode === 'delete' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Hapus</button>
                        </div>
                        <button onClick={() => setRotationStep((prev) => (prev + 1) % 4)} className="w-full py-2.5 text-xs font-bold rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white transition-all active:scale-95 flex items-center justify-center gap-2">
                            <span>Putar Objek (R)</span><span className="text-[14px]">⟳</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-800">
                        <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase px-1">Katalog Bangunan</label>
                        <div ref={scrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar pt-2 pb-4 px-2 cursor-grab active:cursor-grabbing select-none">
                            {Object.entries(BUILDINGS).map(([key, data]) => (
                                <button key={key} onClick={() => setDrawMode(key)} className={`relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 group ${drawMode === key ? 'border-emerald-400 scale-[1.15] translate-y-1 shadow-[0_0_15px_rgba(52,211,153,0.3)] z-10 mx-1' : 'border-slate-700 opacity-60 hover:opacity-100'}`}>
                                    <img src={data.image} alt={data.name} className="w-full h-full object-cover bg-slate-800 pointer-events-none" />
                                    <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] py-0.5 text-center font-mono">{data.sizeX}x{data.sizeZ}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 pb-4 md:pb-0">
                        <button onClick={handleClearPath} className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-400 py-2.5 rounded-xl border border-slate-700 transition-colors">Clear Path</button>
                        <button onClick={handleClearBoard} className="text-[10px] font-bold bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 py-2.5 rounded-xl border border-rose-900/50 transition-colors">Reset Board</button>
                    </div>
                </div>
            </div>

            {/* --- CANVAS 3D --- */}
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
                    <PathfindingGrid triggerRun={triggerRun} algorithm={algorithm} clearPathTrigger={clearPathTrigger} clearBoardTrigger={clearBoardTrigger} drawMode={drawMode} rotationStep={rotationStep} isMobile={isMobile} />
                </Suspense>
            </Canvas>
        </div>
    )
}