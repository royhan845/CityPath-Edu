"use client"

import { useSimulationStore } from "../../stores/useSimulationStore"
import { BUILDINGS, GRID_SIZE, SURFACE_Y, DEFAULT_SIM_SPEED } from "../../config" 
import TemplateSelector from "./TemplateSelector"
import { BookOpen, RefreshCw } from "lucide-react"

export default function EditorPanel({ isMobile, onShowTutorial }: { isMobile: boolean, onShowTutorial: () => void }) {
    const { drawMode, setDrawMode, setRotationStep, executeClearBoard, playbackStatus } = useSimulationStore();

    return (
        <div className={`absolute z-10 flex flex-col bg-[#0B1120]/80 backdrop-blur-xl border-slate-800/60 shadow-2xl transition-all duration-500 ease-in-out ${isMobile ? 'bottom-20 left-4 right-4 rounded-2xl border max-h-[40vh]' : 'top-6 bottom-24 left-6 w-80 rounded-3xl border'} overflow-hidden`}>
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800/60 bg-[#0B1120]/50 flex items-center justify-between">
                <div>
                    <h2 className="text-white font-bold tracking-wide flex items-center gap-2"><span className="text-cyan-400">❖</span> Spatial Editor</h2>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">Build & Configure</p>
                </div>
                <button 
                    onClick={onShowTutorial}
                    className="p-2 bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 rounded-lg transition-all border border-slate-700 hover:border-cyan-500/50"
                    title="Buka Panduan Sistem"
                >
                    <BookOpen size={18} />
                </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {/* 1. Environment Section */}
                <div className={playbackStatus !== 'idle' ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                    <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-3 block">1. Entitas Spasial</label>
                    <div className="flex gap-4 overflow-x-auto pt-2 pb-5 px-2 cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 hover:[&::-webkit-scrollbar-thumb]:bg-cyan-400/60 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(51,65,85,0.5)_transparent]">
                        {Object.entries(BUILDINGS).filter(([_, data]) => data.id >= 7).map(([key, data]) => (
                            <button key={key} onClick={() => setDrawMode(key)} className={`relative w-16 h-16 rounded-xl transition-all shrink-0 flex items-center justify-center ${drawMode === key ? 'border-2 border-cyan-400 scale-110 shadow-[0_0_20px_rgba(34,211,238,0.4)] z-10' : 'border border-slate-700/50 opacity-60 hover:opacity-100 hover:scale-105'}`}>
                                <div className="w-full h-full rounded-[10px] overflow-hidden relative pointer-events-none">
                                    <img src={data.image} alt={data.name} className="w-full h-full object-cover bg-slate-900" />
                                    <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] py-1 text-center font-mono text-cyan-400 font-bold">{data.sizeX}x{data.sizeZ}</div>
                                </div>
                            </button>
                        ))}
                    </div>                    
                    <TemplateSelector />
                </div>

                {/* 2. Navigation Tools */}
                <div className={playbackStatus !== 'idle' ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                    <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-3 block">2. Modul Navigasi</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setDrawMode("select")} className={`py-2 text-xs font-medium rounded-lg border transition-all ${drawMode === 'select' ? 'bg-cyan-400/10 border-cyan-400/50 text-cyan-400' : 'bg-slate-800/30 border-white/5 hover:border-white/20 text-slate-400'}`}>Seleksi / Rotasi</button>
                        <button onClick={() => setDrawMode("delete")} className={`py-2 text-xs font-medium rounded-lg border transition-all ${drawMode === 'delete' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-slate-800/30 border-white/5 hover:border-white/20 text-slate-400'}`}>Hapus Entitas</button>
                        <button onClick={() => setDrawMode("start")} className={`py-2 text-xs font-medium rounded-lg border transition-all ${drawMode === 'start' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-800/30 border-white/5 hover:border-white/20 text-slate-400'}`}>Titik Awal (A)</button>
                        <button onClick={() => setDrawMode("end")} className={`py-2 text-xs font-medium rounded-lg border transition-all ${drawMode === 'end' ? 'bg-cyan-400/20 border-cyan-400 text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'bg-slate-800/30 border-white/5 hover:border-white/20 text-slate-400'}`}>Titik Tujuan (B)</button>
                    </div>
                    <button 
                        onClick={() => setRotationStep((prev) => (prev + 1) % 4)} 
                        className="w-full mt-3 py-2 text-[10px] font-mono tracking-widest uppercase rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={12} /> Rotasi Entitas [R]
                    </button>
                </div>

                {/* Footer Action */}
                <div className="border-t border-slate-800/60 pt-4 mt-auto">
                    <button 
                        onClick={executeClearBoard} 
                        disabled={playbackStatus !== 'idle'} 
                        className="w-full py-2.5 text-xs font-mono tracking-widest uppercase rounded-lg bg-slate-900 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 transition-all border border-slate-800 hover:border-rose-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Purge Environment
                    </button>
                </div>
            </div>
        </div>
    )
}