"use client"

import { useState, useRef, useEffect } from "react"
import { useSimulationStore } from "../../stores/useSimulationStore"
import { BarChart2, X } from "lucide-react"

export default function MetricsPanel({ isMobile, onOpenReport }: { isMobile: boolean, onOpenReport: () => void }) {
    const { algorithm, setAlgorithm, executeClearPath, playbackStatus, stats, hasNewReport, setHasNewReport, mobileMenuOpen, setMobileMenuOpen, showTutorial, tutorialStep } = useSimulationStore();
    
    const isOpen = mobileMenuOpen === 'metrics';

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const step5Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showTutorial) {
            setTimeout(() => {
                const container = scrollContainerRef.current;
                if (!container) return;

                if (tutorialStep === 4) {
                    container.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (tutorialStep === 6 && step5Ref.current) {
                    container.scrollTo({ top: step5Ref.current.offsetTop - 20, behavior: 'smooth' });
                }
            }, 300);
        }
    }, [tutorialStep, showTutorial]);

    const algorithmDetails: Record<string, { title: string, desc: string, color: string, time: string, space: string, tag: string }> = {
        astar: { title: "A* Search", color: "text-emerald-400", time: "O(E)", space: "O(V)", tag: "Optimal & Cepat", desc: "Menggunakan Heuristik untuk memprioritaskan node terdekat ke target." },
        greedy: { title: "Greedy BFS", color: "text-yellow-400", time: "O(V)", space: "O(V)", tag: "Cepat, Tidak Optimal", desc: "Agresif ke arah target tanpa mempedulikan total jarak tempuh." },
        dijkstra: { title: "Dijkstra", color: "text-cyan-400", time: "O(V²)", space: "O(V)", tag: "Pasti Optimal", desc: "Mengekspansi area secara radial layaknya gelombang air." },
        bfs: { title: "Breadth-First", color: "text-blue-400", time: "O(V+E)", space: "O(V)", tag: "Eksplorasi Level", desc: "Menelusuri grid lapis demi lapis. Sangat andal untuk labirin murni." },
        dfs: { title: "Depth-First", color: "text-rose-400", time: "O(V+E)", space: "O(V)", tag: "Eksplorasi Dalam", desc: "Menyusuri satu lorong sedalam-dalamnya secara membabi buta." }
    };

    return (
        <>
            {isMobile && mobileMenuOpen === null && (
                <button 
                    onClick={() => setMobileMenuOpen('metrics')}
                    disabled={playbackStatus !== 'idle' || showTutorial} 
                    className={`absolute ${playbackStatus === 'idle' ? 'bottom-[230px]' : 'bottom-[160px]'} right-4 z-50 p-3 rounded-xl shadow-lg transition-all duration-500 flex items-center gap-2 border 
                    ${playbackStatus !== 'idle' 
                        ? 'opacity-40 cursor-not-allowed grayscale bg-[#0f172a]/60 border-white/10 text-slate-400' 
                        : (hasNewReport ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 animate-pulse' : 'bg-[#0f172a]/60 backdrop-blur-xl border-white/10 text-slate-300')
                    }`}
                >
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Metrics</span>
                    <BarChart2 size={18} />
                </button>
            )}

            <div className={`absolute flex flex-col bg-[#0f172a]/60 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
                ${isMobile 
                    ? `bottom-0 left-0 right-0 w-full rounded-t-3xl border-t ${showTutorial ? 'h-[52vh]' : 'h-[65vh]'} ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}` 
                    : 'top-6 bottom-24 right-4 md:w-[260px] lg:right-6 lg:w-80 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                }
                ${showTutorial && [4, 6].includes(tutorialStep) ? 'z-[999] pointer-events-none' : 'z-40'}
            `}>
                {isMobile && (
                    <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                        <span className="font-bold text-slate-200 font-mono text-[10px] tracking-widest uppercase">Analytics Matrix</span>
                        <button onClick={() => setMobileMenuOpen(null)} className="p-2 bg-white/5 text-slate-400 hover:text-rose-400 rounded-xl border border-white/5 hover:border-rose-500/30 pointer-events-auto">
                            <X size={18} />
                        </button>
                    </div>
                )}

                <div className={`transition-all duration-500 relative
                    ${showTutorial && tutorialStep === 4 
                        ? 'm-3 md:m-4 p-4 rounded-2xl ring-2 ring-emerald-400 bg-emerald-400/10 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                        : 'p-4 md:p-5 border-b border-white/10 bg-white/5 md:rounded-t-3xl'}
                    ${showTutorial && tutorialStep !== 4 ? 'opacity-30 grayscale' : ''}
                `}>
                    <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase block mb-2">Pilih Algoritma</label>
                    <select 
                        value={algorithm}
                        onChange={(e) => setAlgorithm(e.target.value)}
                        disabled={playbackStatus !== 'idle'} 
                        className="w-full bg-[#0f172a]/80 text-sm font-medium text-white border border-white/10 rounded-xl px-3 py-3 outline-none focus:border-cyan-500 transition-all cursor-pointer disabled:opacity-50 appearance-none"
                    >
                        <option value="astar">A* (A-Star) Search</option>
                        <option value="greedy">Greedy Best-First</option>
                        <option value="dijkstra">Dijkstra's Algorithm</option>
                        <option value="bfs">Breadth-First Search</option>
                        <option value="dfs">Depth-First Search</option>
                    </select>
                </div>
                
                <div ref={scrollContainerRef} className={`px-5 pt-3 pb-5 flex-1 overflow-y-auto relative flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${showTutorial ? 'pointer-events-auto' : ''}`}>
                    
                    <div className={`transition-all duration-500 ${showTutorial ? 'opacity-30 pointer-events-none' : ''}`}>
                        <div className="flex items-start justify-between mb-3">
                            <h3 className={`text-lg font-bold ${algorithmDetails[algorithm].color}`}>{algorithmDetails[algorithm].title}</h3>
                            <span className="text-[9px] px-2 py-1 bg-white/10 rounded-md font-mono text-slate-300 border border-white/10">{algorithmDetails[algorithm].tag}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-5">{algorithmDetails[algorithm].desc}</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white/5 border border-white/10 p-3 rounded-xl"><span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Time Complexity</span><span className="text-sm font-mono text-white">{algorithmDetails[algorithm].time}</span></div>
                            <div className="bg-white/5 border border-white/10 p-3 rounded-xl"><span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Space Complexity</span><span className="text-sm font-mono text-white">{algorithmDetails[algorithm].space}</span></div>
                        </div>
                        
                        <div className="border-t border-white/10 pt-5 mb-4">
                            <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase block mb-3">Real-time Statistics</label>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-xl border border-white/10"><span className="text-xs text-slate-400">Nodes Evaluated</span><span className="text-sm font-mono text-cyan-400 font-bold">{stats ? stats.visited : '-'}</span></div>
                                <div className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-xl border border-white/10"><span className="text-xs text-slate-400">Path Length</span><span className="text-sm font-mono text-emerald-400 font-bold">{stats ? stats.path : '-'}</span></div>
                                <div className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-xl border border-white/10"><span className="text-xs text-slate-400">Exec Time (ms)</span><span className="text-sm font-mono text-amber-400 font-bold">{stats ? (stats.time < 0.01 ? '< 0.01' : stats.time.toFixed(2)) : '-'}</span></div>
                            </div>
                        </div>
                    </div>

                    <div ref={step5Ref} className="mt-auto pb-6 md:pb-0 pt-2">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (showTutorial) return; 

                                if (hasNewReport) setHasNewReport(false); 
                                setMobileMenuOpen(null);
                                onOpenReport();
                            }}
                            className={`w-full py-3 relative z-50 cursor-pointer rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 
                            ${showTutorial && tutorialStep === 6 
                                ? 'ring-2 ring-inset ring-purple-500 shadow-[inset_0_0_30px_rgba(168,85,247,0.3)] bg-purple-500/20 text-purple-300 border-transparent' 
                                : (hasNewReport ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 animate-pulse' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10')
                            }
                            ${showTutorial && tutorialStep !== 6 ? 'opacity-30 grayscale' : ''}
                            ${showTutorial ? 'pointer-events-none' : 'pointer-events-auto'}
                            `}
                        >
                            Performance Analytics
                        </button>
                    </div>

                </div>
            </div>
        </>
    )
}