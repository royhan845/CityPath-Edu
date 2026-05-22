"use client"
import { useState, useEffect, useRef } from "react"
import { solvePathfinding } from "../../utils/miniPathfinder"

type AlgoType = 'astar' | 'dijkstra' | 'greedy' | 'bfs' | 'dfs';

export default function MiniLiveVisualization() {
    const [algo, setAlgo] = useState<AlgoType>('astar');
    const [visited, setVisited] = useState<number[]>([]);
    const [path, setPath] = useState<number[]>([]);
    const [isSearching, setIsSearching] = useState(true);

    // Gunakan ref untuk melacak timer agar bisa dihentikan paksa
    const vIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Fungsi bersih-bersih total
    const killAllProcesses = () => {
        if (vIntervalRef.current) clearInterval(vIntervalRef.current);
        if (pIntervalRef.current) clearInterval(pIntervalRef.current);
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };

    const runSimulation = () => {
        killAllProcesses();
        
        setVisited([]); 
        setPath([]); 
        setIsSearching(true);
        
        const { v, p } = solvePathfinding(algo);
        let step = 0;
        
        vIntervalRef.current = setInterval(() => {
            if (step < v.length) {
                setVisited(prev => [...prev, v[step]]);
                step++;
            } else {
                if (vIntervalRef.current) clearInterval(vIntervalRef.current);
                setIsSearching(false);
                
                let pStep = 0;
                pIntervalRef.current = setInterval(() => {
                    if (pStep < p.length) {
                        setPath(prev => [...prev, p[pStep]]);
                        pStep++;
                    } else {
                        if (pIntervalRef.current) clearInterval(pIntervalRef.current);
                        resetTimerRef.current = setTimeout(runSimulation, 2500);
                    }
                }, 50);
            }
        }, 40);
    };

    useEffect(() => {
        runSimulation();
        return () => killAllProcesses();
    }, [algo]); 

    return (
        <div className="w-full max-w-[280px] mx-auto mt-4 mb-6">
            <div className="flex justify-between items-end mb-3">
                <div className="flex flex-col text-left font-mono text-[9px] tracking-widest text-slate-500 uppercase">
                    <span className="text-[#38BDF8] font-bold drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]">System Status</span>
                    <span>Algo : {algo}</span>
                    <span>Nodes: {visited.length + path.length} explored</span>
                    <span>State: {isSearching ? <span className="text-cyan-400 animate-pulse">Computing...</span> : <span className="text-emerald-400">Path Locked</span>}</span>
                </div>
            </div>

            {/* Tombol Algoritma */}
            <div className="relative z-50 pointer-events-auto flex flex-wrap justify-center gap-1 mb-4">
                {(['astar', 'dijkstra', 'greedy', 'bfs', 'dfs'] as const).map(a => (
                    <button 
                        key={a} 
                        onClick={() => {
                            setAlgo(a);
                        }}
                        className={`flex-1 min-w-[30%] text-[9px] font-mono font-bold py-1.5 rounded-[3px] transition-all uppercase tracking-widest border ${
                            algo === a 
                            ? 'bg-cyan-400/20 text-cyan-400 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                            : 'bg-transparent text-slate-500 border-white/5 hover:border-white/20 hover:text-slate-300'
                        }`}
                    >
                        {a}
                    </button>
                ))}
            </div>

            {/* Grid Visualisasi */}
            <div className="grid grid-cols-8 gap-[1px] p-2 bg-[#060816]/80 backdrop-blur-md border border-white/5 rounded-md shadow-inner relative overflow-hidden group">
                {Array.from({ length: 64 }).map((_, i) => {
                    const isTarget = i === 63;
                    const isStart = i === 0;
                    const isPath = path.includes(i);
                    const isVisited = visited.includes(i) && !isPath;
                    const isFrontier = i === visited[visited.length - 1];

                    return (
                        <div 
                            key={i} 
                            className={`aspect-square rounded-[1px] transition-all duration-300 relative ${
                                isTarget ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)] z-20' 
                                : isStart ? 'bg-[#38BDF8] shadow-[0_0_10px_#38BDF8] z-20' 
                                : isPath ? 'bg-white shadow-[0_0_12px_#ffffff] z-10 scale-110' 
                                : isFrontier ? 'bg-cyan-200 animate-pulse z-20' 
                                : isVisited ? 'bg-[#0F172A] border border-cyan-400/40 shadow-[inset_0_0_5px_rgba(34,211,238,0.2)]' 
                                : 'bg-white/[0.02] border border-white/[0.02] group-hover:border-white/[0.05]' 
                            }`} 
                        />
                    )
                })}
            </div>
        </div>
    )
}