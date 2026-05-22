"use client"

import { useSimulationStore } from "../../stores/useSimulationStore"
import { FastForward, Zap, Route, Network, ArrowRightCircle, Target } from "lucide-react";

export default function PlaybackControls() {
    
    const { 
        algorithm, playbackStatus, setPlaybackStatus, liveText, 
        simSpeed, setSimSpeed, executeRun, executeClearPath, 
        executeStepForward, executeStepBackward, executeStop, executeSkip
    } = useSimulationStore();

    // Mapping icon menggunakan Lucide-React agar seragam dan modern
    const getAlgoIcon = (algo: string) => {
        switch(algo) {
            case 'astar': return <Target size={18} className="text-emerald-400" />; 
            case 'greedy': return <Zap size={18} className="text-yellow-400" />;
            case 'dijkstra': return <Network size={18} className="text-cyan-400" />; 
            case 'bfs': return <ArrowRightCircle size={18} className="text-blue-400" />;
            case 'dfs': return <Route size={18} className="text-rose-400" />; 
            default: return <Target size={18} className="text-slate-400" />;
        }
    }

    return (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-[90%] md:w-[600px]">
            <div className="mb-3 text-center">
                <span className="inline-flex items-center gap-2 bg-[#0B1120]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-800 shadow-lg">
                    <span className={`w-1.5 h-1.5 rounded-full ${playbackStatus === 'playing' ? 'bg-cyan-500 animate-pulse' : playbackStatus === 'paused' ? 'bg-amber-500' : 'bg-slate-600'}`}></span>
                    <span className="text-[10px] font-mono text-slate-300">{liveText}</span>
                </span>
            </div>

            <div className="bg-[#0B1120]/90 backdrop-blur-xl border border-slate-700/50 p-2 md:p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-4">
                {playbackStatus === 'idle' ? (
                    <>
                        <div className="flex items-center gap-2 w-full md:w-auto justify-center">
                            <button onClick={executeClearPath} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors" title="Reset Jalur">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                            <button onClick={executeRun} className="px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#050816] shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                <span>▶</span> Execute
                            </button>
                        </div>
                        <div className="flex-1 w-full px-4 border-t md:border-t-0 md:border-l border-slate-700/50 pt-3 md:pt-0 flex flex-col justify-center">
                            <div className="flex justify-between items-end mb-1.5">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sim Speed</span>
                                <span className="text-[10px] font-mono text-cyan-400">{simSpeed} ms/step</span>
                            </div>
                            <input type="range" min="10" max="200" step="10" value={simSpeed} onChange={(e) => setSimSpeed(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                        </div>
                    </>
                ) : (
                    <div className="w-full flex items-center justify-between px-2">
                        <button onClick={executeStop} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 transition-colors" title="Batalkan">⏹</button>
                        <div className="flex items-center gap-3">
                            <button onClick={executeStepBackward} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors" title="Mundur 1 Langkah">⏮</button>
                            <button onClick={() => setPlaybackStatus(playbackStatus === 'paused' ? 'playing' : 'paused')} className="w-14 h-14 flex items-center justify-center rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#050816] text-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all active:scale-95">
                                {playbackStatus === 'paused' ? '▶' : '⏸'}
                            </button>
                            <button onClick={executeStepForward} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors" title="Maju 1 Langkah">⏭</button>
                        </div>
                        <button 
                            onClick={executeSkip}
                            disabled={playbackStatus !== 'playing'}
                            className={`p-2 rounded-lg transition-colors ${
                                playbackStatus === 'playing' 
                                ? 'text-cyan-400 hover:bg-cyan-500/20' 
                                : 'text-slate-600 cursor-not-allowed'
                            }`}
                            title="Lewati Animasi"
                        >
                            <FastForward size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}