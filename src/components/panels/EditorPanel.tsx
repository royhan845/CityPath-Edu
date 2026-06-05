"use client"

import { useState, useRef, useEffect } from "react"
import { useSimulationStore } from "../../stores/useSimulationStore"
import { BUILDINGS } from "../../config" 
import TemplateSelector from "./TemplateSelector"
import { BookOpen, RefreshCw, Layers, X } from "lucide-react"

export default function EditorPanel({ isMobile, onShowTutorial }: { isMobile: boolean, onShowTutorial: () => void }) {
    const { drawMode, setDrawMode, setRotationStep, executeClearBoard, playbackStatus, mobileMenuOpen, setMobileMenuOpen, showTutorial, tutorialStep } = useSimulationStore();
    const isOpen = mobileMenuOpen === 'editor';

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const step1Ref = useRef<HTMLDivElement>(null);
    const step2Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showTutorial) {
            setTimeout(() => {
                const container = scrollContainerRef.current;
                if (!container) return;

                if (tutorialStep === 2 && step1Ref.current) {
                    container.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (tutorialStep === 3 && step2Ref.current) {
                    container.scrollTo({ top: step2Ref.current.offsetTop - 20, behavior: 'smooth' });
                }
            }, 300);
        }
    }, [tutorialStep, showTutorial]);

    return (
        <>
            {isMobile && mobileMenuOpen === null && (
                <button 
                    onClick={() => setMobileMenuOpen('editor')}
                    disabled={playbackStatus !== 'idle' || showTutorial} 
                    className={`absolute ${playbackStatus === 'idle' ? 'bottom-[230px]' : 'bottom-[160px]'} left-4 z-50 p-3 rounded-xl shadow-lg transition-all duration-500 flex items-center gap-2 border border-white/10 bg-[#0f172a]/60 backdrop-blur-xl 
                    ${playbackStatus !== 'idle' ? 'opacity-40 cursor-not-allowed grayscale' : 'text-slate-300 hover:text-cyan-400 hover:border-cyan-400/30'}`}
                >
                    <Layers size={18} />
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Editor</span>
                </button>
            )}

            <div className={`absolute flex flex-col bg-[#0f172a]/60 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
                ${isMobile 
                    ? `bottom-0 left-0 right-0 w-full rounded-t-3xl border-t ${showTutorial ? 'h-[52vh]' : 'h-[65vh]'} ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}` 
                    : 'top-6 bottom-24 left-4 md:w-[260px] lg:left-6 lg:w-80 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                }
                ${showTutorial && [2, 3].includes(tutorialStep) ? 'z-[999] pointer-events-none' : 'z-40'}
            `}>
                <div className={`p-4 md:p-5 border-b border-white/10 bg-white/5 flex items-center justify-between transition-opacity duration-500 ${showTutorial ? 'opacity-50' : ''}`}>
                    <div>
                        <h2 className="text-white font-bold tracking-wide flex items-center gap-2"><span className="text-cyan-400">❖</span> Spatial Editor</h2>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-mono">Build & Configure</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onShowTutorial} className={`p-2 bg-white/5 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 rounded-xl transition-all border border-white/5 hover:border-cyan-500/30 ${showTutorial ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                            <BookOpen size={18} />
                        </button>
                        {isMobile && (
                            <button onClick={() => setMobileMenuOpen(null)} className={`p-2 bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-xl transition-all border border-white/5 ${showTutorial ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
                
                <div ref={scrollContainerRef} className={`p-5 overflow-y-auto relative flex flex-col gap-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${showTutorial ? 'pointer-events-auto' : ''}`}>
                    
                    <div ref={step1Ref} className={`p-3 -mx-3 rounded-2xl transition-all duration-500
                        ${showTutorial && tutorialStep === 2 ? 'ring-2 ring-inset ring-cyan-400 bg-cyan-400/10 shadow-[inset_0_0_30px_rgba(34,211,238,0.2)]' : ''}
                        ${showTutorial && tutorialStep !== 2 ? 'opacity-30 grayscale' : ''}
                        ${playbackStatus !== 'idle' && !showTutorial ? 'opacity-50' : ''}
                    `}>
                        <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-3 block">1. Entitas Spasial</label>
                        <div className="flex gap-4 overflow-x-auto pt-2 pb-5 px-2 cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700/50 hover:[&::-webkit-scrollbar-thumb]:bg-cyan-400/60 [&::-webkit-scrollbar-thumb]:rounded-full [scrollbar-width:thin] [scrollbar-color:rgba(51,65,85,0.5)_transparent]">
                            {Object.entries(BUILDINGS).filter(([_, data]) => data.id >= 7).map(([key, data]) => (
                                <button key={key} 
                                    onClick={() => setDrawMode(key)} 
                                    className={`relative w-16 h-16 rounded-xl transition-all shrink-0 flex items-center justify-center ${drawMode === key ? 'border-2 border-cyan-400 scale-110 shadow-[0_0_20px_rgba(34,211,238,0.4)] z-10' : 'border border-white/10 opacity-60 hover:opacity-100 hover:scale-105 hover:border-cyan-400/30'}`}
                                >
                                    <div className="w-full h-full rounded-[10px] overflow-hidden relative pointer-events-none">
                                        <img src={data.image} alt={data.name} className="w-full h-full object-cover bg-slate-900" />
                                        <div className="absolute bottom-0 inset-x-0 bg-[#0f172a]/80 backdrop-blur-sm text-[9px] py-1 text-center font-mono text-cyan-400 font-bold">{data.sizeX}x{data.sizeZ}</div>
                                    </div>
                                </button>
                            ))}
                        </div>                    
                        <TemplateSelector />
                    </div>

                    <div ref={step2Ref} className={`p-4 -mx-4 rounded-2xl transition-all duration-500 flex flex-col gap-4 mt-auto
                        ${showTutorial && tutorialStep === 3 ? 'ring-2 ring-inset ring-blue-400 bg-blue-400/10 shadow-[inset_0_0_30px_rgba(96,165,250,0.2)]' : ''}
                        ${showTutorial && tutorialStep !== 3 ? 'opacity-30 grayscale' : ''}
                        ${playbackStatus !== 'idle' && !showTutorial ? 'opacity-50' : ''}
                    `}>
                        <div>
                            <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-3 block">2. Modul Navigasi</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => setDrawMode("select")} className={`py-2 text-xs font-medium rounded-xl border transition-all ${drawMode === 'select' ? 'bg-cyan-400/10 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-white/5 border-white/5 hover:border-cyan-400/30 hover:bg-white/10 text-slate-300'}`}>Seleksi / Rotasi</button>
                                <button onClick={() => setDrawMode("delete")} className={`py-2 text-xs font-medium rounded-xl border transition-all ${drawMode === 'delete' ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-white/5 border-white/5 hover:border-rose-400/30 hover:bg-white/10 text-slate-300'}`}>Hapus Entitas</button>
                                <button onClick={() => setDrawMode("start")} className={`py-2 text-xs font-medium rounded-xl border transition-all ${drawMode === 'start' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 border-white/5 hover:border-emerald-400/30 hover:bg-white/10 text-slate-300'}`}>Titik Awal (A)</button>
                                <button onClick={() => setDrawMode("end")} className={`py-2 text-xs font-medium rounded-xl border transition-all ${drawMode === 'end' ? 'bg-cyan-400 border-cyan-400 text-[#0f172a] shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'bg-white/5 border-white/5 hover:border-cyan-400/30 hover:bg-white/10 text-slate-300'}`}>Titik Tujuan (B)</button>
                            </div>
                            <button onClick={() => setRotationStep((prev) => (prev + 1) % 4)} className="w-full mt-3 py-2 text-[10px] font-mono tracking-widest uppercase rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 text-slate-300 transition-all flex items-center justify-center gap-2">
                                <RefreshCw size={12} /> Rotasi Entitas [R]
                            </button>
                        </div>

                        <div className="border-t border-white/10 pt-4">
                            <button onClick={executeClearBoard} disabled={playbackStatus !== 'idle'} className="w-full py-2.5 text-xs font-mono tracking-widest uppercase rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-white/5 hover:border-rose-500/30 disabled:opacity-30 disabled:cursor-not-allowed">
                                Purge Environment
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}