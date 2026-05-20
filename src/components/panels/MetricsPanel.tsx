"use client"

import { useSimulationStore } from "../../stores/useSimulationStore"

export default function MetricsPanel({ isMobile, onOpenReport }: { isMobile: boolean, onOpenReport: () => void }) {
    const { algorithm, setAlgorithm, executeClearPath, playbackStatus, stats, hasNewReport, setHasNewReport } = useSimulationStore();

    const algorithmDetails: Record<string, { title: string, desc: string, color: string, time: string, space: string, tag: string }> = {
        astar: { title: "A* Search", color: "text-emerald-400", time: "O(E)", space: "O(V)", tag: "Optimal & Cepat", desc: "Menggunakan Heuristik untuk memprioritaskan node terdekat ke target." },
        greedy: { title: "Greedy BFS", color: "text-yellow-400", time: "O(V)", space: "O(V)", tag: "Cepat, Tidak Optimal", desc: "Agresif ke arah target tanpa mempedulikan total jarak tempuh." },
        dijkstra: { title: "Dijkstra", color: "text-cyan-400", time: "O(V²)", space: "O(V)", tag: "Pasti Optimal", desc: "Mengekspansi area secara radial layaknya gelombang air." },
        bfs: { title: "Breadth-First", color: "text-blue-400", time: "O(V+E)", space: "O(V)", tag: "Eksplorasi Level", desc: "Menelusuri grid lapis demi lapis. Sangat andal untuk labirin murni." },
        dfs: { title: "Depth-First", color: "text-rose-400", time: "O(V+E)", space: "O(V)", tag: "Eksplorasi Dalam", desc: "Menyusuri satu lorong sedalam-dalamnya secara membabi buta." }
    };

    return (
        <div className={`absolute z-10 flex flex-col bg-[#0B1120]/80 backdrop-blur-xl border-slate-800/60 shadow-2xl transition-all duration-500 ease-in-out ${isMobile ? 'hidden' : 'top-6 bottom-24 right-6 w-80 rounded-3xl border'} overflow-hidden`}>
            <div className="p-5 border-b border-slate-800/60 bg-[#0B1120]/50">
                <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase block mb-2">Pilih Algoritma</label>
                <select disabled={playbackStatus !== 'idle'} className="w-full bg-[#050816] text-sm font-medium text-white border border-slate-700/50 rounded-xl px-3 py-3 outline-none focus:border-cyan-500 transition-all cursor-pointer disabled:opacity-50" value={algorithm} onChange={(e) => { setAlgorithm(e.target.value); executeClearPath(); }}>
                    <option value="astar">A* (A-Star) Search</option>
                    <option value="greedy">Greedy Best-First</option>
                    <option value="dijkstra">Dijkstra's Algorithm</option>
                    <option value="bfs">Breadth-First Search</option>
                    <option value="dfs">Depth-First Search</option>
                </select>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex items-start justify-between mb-3">
                    <h3 className={`text-lg font-bold ${algorithmDetails[algorithm].color}`}>{algorithmDetails[algorithm].title}</h3>
                    <span className="text-[9px] px-2 py-1 bg-slate-800 rounded-md font-mono text-slate-400 border border-slate-700">{algorithmDetails[algorithm].tag}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-5">{algorithmDetails[algorithm].desc}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl"><span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Time Complexity</span><span className="text-sm font-mono text-white">{algorithmDetails[algorithm].time}</span></div>
                    <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl"><span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Space Complexity</span><span className="text-sm font-mono text-white">{algorithmDetails[algorithm].space}</span></div>
                </div>
                
                <div className="border-t border-slate-800/60 pt-5 mt-auto">
                    <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase block mb-3">Real-time Statistics</label>
                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center bg-[#050816] px-4 py-2.5 rounded-lg border border-slate-800/50"><span className="text-xs text-slate-400">Nodes Evaluated</span><span className="text-sm font-mono text-cyan-400 font-bold">{stats ? stats.visited : '-'}</span></div>
                        <div className="flex justify-between items-center bg-[#050816] px-4 py-2.5 rounded-lg border border-slate-800/50"><span className="text-xs text-slate-400">Path Length</span><span className="text-sm font-mono text-emerald-400 font-bold">{stats ? stats.path : '-'}</span></div>
                        <div className="flex justify-between items-center bg-[#050816] px-4 py-2.5 rounded-lg border border-slate-800/50"><span className="text-xs text-slate-400">Exec Time (ms)</span><span className="text-sm font-mono text-amber-400 font-bold">{stats ? (stats.time < 0.01 ? '< 0.01' : stats.time.toFixed(2)) : '-'}</span></div>
                    </div>
                    
                    {/* 2. Tombol dengan Indikator Notifikasi Merah */}
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if (hasNewReport) {
                                setHasNewReport(false); 
                            }
                            onOpenReport();
                        }}
                        className={`w-full py-3 pointer-events-auto relative z-50 cursor-pointer rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                            hasNewReport 
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse' 
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                        }`}
                    >
                        {/* Dot Merah Berkedip */}
                        {hasNewReport && (
                            <span className="relative flex h-2.5 w-2.5 mr-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                            </span>
                        )}
                        Performance Analytics
                    </button>
                </div>
            </div>
        </div>
    )
}