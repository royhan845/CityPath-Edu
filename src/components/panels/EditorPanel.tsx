"use client"

import { useState } from "react"
import { useSimulationStore } from "../../stores/useSimulationStore"
import { BUILDINGS } from "../../config" 
import TemplateSelector from "./TemplateSelector"
import { BookOpen, RefreshCw, Layers, X } from "lucide-react"

export default function EditorPanel({ isMobile, onShowTutorial }: { isMobile: boolean, onShowTutorial: () => void }) {
    const { drawMode, setDrawMode, setRotationStep, executeClearBoard, playbackStatus, mobileMenuOpen, setMobileMenuOpen } = useSimulationStore();
    
    const isOpen = mobileMenuOpen === 'editor';

    return (
        <>
            {isMobile && mobileMenuOpen === null && (
                <button 
                    onClick={() => setMobileMenuOpen('editor')}
                    disabled={playbackStatus !== 'idle'} 
                    className={`absolute ${playbackStatus === 'idle' ? 'bottom-[230px]' : 'bottom-[160px]'} left-4 z-50 p-3 rounded-xl shadow-lg transition-all duration-500 flex items-center gap-2 border border-white/10 bg-[#0f172a]/60 backdrop-blur-xl 
                    ${playbackStatus !== 'idle' ? 'opacity-40 cursor-not-allowed grayscale' : 'text-slate-300 hover:text-cyan-400 hover:border-cyan-400/30'}`}
                >
                    <Layers size={18} />
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Editor</span>
                </button>
            )}

            {/* Main Panel Glassmorphism */}
            <div className={`absolute z-40 flex flex-col bg-[#0f172a]/60 backdrop-blur-xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
                ${isMobile 
                    ? `bottom-0 left-0 right-0 w-full rounded-t-3xl border-t h-[65vh] ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}` 
                    : 'top-6 bottom-24 left-6 w-80 rounded-3xl border'
                }`}
            >
                <div className="p-4 md:p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-bold tracking-wide flex items-center gap-2"><span className="text-cyan-400">❖</span> Spatial Editor</h2>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-mono">Build & Configure</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Clean Buttons */}
                        <button onClick={onShowTutorial} className="p-2 bg-white/5 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 rounded-xl transition-all border border-white/5 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]">
                            <BookOpen size={18} />
                        </button>
                        
                        {isMobile && (
                            <button onClick={() => setMobileMenuOpen(null)} className="p-2 bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition-all border border-white/5 hover:border-rose-500/30">
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="p-5 overflow-y-auto flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    
                    <div className={playbackStatus !== 'idle' ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                        <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-3 block">1. Entitas Spasial</label>
                        <div className="flex gap-4 overflow-x-auto pt-2 pb-5 px-2 cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 hover:[&::-webkit-scrollbar-thumb]:bg-cyan-400/60 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(51,65,85,0.5)_transparent]">
                            {Object.entries(BUILDINGS).filter(([_, data]) => data.id >= 7).map(([key, data]) => (
                                <button key={key} onClick={() => setDrawMode(key)} className={`relative w-16 h-16 rounded-xl transition-all shrink-0 flex items-center justify-center ${drawMode === key ? 'border-2 border-cyan-400 scale-110 shadow-[0_0_20px_rgba(34,211,238,0.4)] z-10' : 'border border-white/10 opacity-60 hover:opacity-100 hover:scale-105 hover:border-cyan-400/30'}`}>
                                    <div className="w-full h-full rounded-[10px] overflow-hidden relative pointer-events-none">
                                        <img src={data.image} alt={data.name} className="w-full h-full object-cover bg-slate-900" />
                                        <div className="absolute bottom-0 inset-x-0 bg-[#0f172a]/80 backdrop-blur-sm text-[9px] py-1 text-center font-mono text-cyan-400 font-bold">{data.sizeX}x{data.sizeZ}</div>
                                    </div>
                                </button>
                            ))}
                        </div>                    
                        <TemplateSelector />
                    </div>

                    <div className={playbackStatus !== 'idle' ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                        <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-3 block">2. Modul Navigasi</label>
                        <div className="grid grid-cols-2 gap-2">
                            {/* Clean Tools Buttons */}
                            <button onClick={() => setDrawMode("select")} className={`py-2 text-xs font-medium rounded-xl border transition-all ${drawMode === 'select' ? 'bg-cyan-400/10 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-white/5 border-white/5 hover:border-cyan-400/30 hover:bg-white/10 text-slate-300'}`}>Seleksi / Rotasi</button>
                            <button onClick={() => setDrawMode("delete")} className={`py-2 text-xs font-medium rounded-xl border transition-all ${drawMode === 'delete' ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-white/5 border-white/5 hover:border-rose-400/30 hover:bg-white/10 text-slate-300'}`}>Hapus Entitas</button>
                            <button onClick={() => setDrawMode("start")} className={`py-2 text-xs font-medium rounded-xl border transition-all ${drawMode === 'start' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 border-white/5 hover:border-emerald-400/30 hover:bg-white/10 text-slate-300'}`}>Titik Awal (A)</button>
                            <button onClick={() => setDrawMode("end")} className={`py-2 text-xs font-medium rounded-xl border transition-all ${drawMode === 'end' ? 'bg-cyan-400 border-cyan-400 text-[#0f172a] shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'bg-white/5 border-white/5 hover:border-cyan-400/30 hover:bg-white/10 text-slate-300'}`}>Titik Tujuan (B)</button>
                        </div>
                        <button 
                            onClick={() => setRotationStep((prev) => (prev + 1) % 4)} 
                            className="w-full mt-3 py-2 text-[10px] font-mono tracking-widest uppercase rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 text-slate-300 transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={12} /> Rotasi Entitas [R]
                        </button>
                    </div>

                    <div className="border-t border-white/10 pt-4 mt-auto pb-6 md:pb-0">
                        <button 
                            onClick={executeClearBoard} 
                            disabled={playbackStatus !== 'idle'} 
                            className="w-full py-2.5 text-xs font-mono tracking-widest uppercase rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-white/5 hover:border-rose-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Purge Environment
                        </button>
                    </div>
                </div>

            </div>
        </>
    )
}