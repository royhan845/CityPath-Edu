"use client"
import { useState, useEffect } from "react"

export default function MiniLiveVisualization() {
    const [algo, setAlgo] = useState<'astar' | 'dijkstra' | 'greedy'>('astar');
    const [visited, setVisited] = useState<number[]>([]);
    const [path, setPath] = useState<number[]>([]);
    const [isSearching, setIsSearching] = useState(true);

    const simData = {
        astar: { v: [1,8,9,17,26,35,44,53,62], p: [0,9,18,27,35,44,53,62,63] },
        dijkstra: { v: [1,8,2,9,16,3,10,17,24,11,18,25,19,26,33,27,35,44,53,62], p: [0,9,18,27,35,44,53,62,63] },
        greedy: { v: [9,18,27,36,45,54,63], p: [0,9,18,27,36,45,54,63] }
    };

    useEffect(() => {
        setVisited([]); setPath([]); setIsSearching(true);
        let step = 0;
        
        const vInterval = setInterval(() => {
            if (step < simData[algo].v.length) {
                setVisited(prev => [...prev, simData[algo].v[step]]);
                step++;
            } else {
                clearInterval(vInterval);
                setIsSearching(false);
                let pStep = 0;
                const pInterval = setInterval(() => {
                    if (pStep < simData[algo].p.length) {
                        setPath(prev => [...prev, simData[algo].p[pStep]]);
                        pStep++;
                    } else {
                        clearInterval(pInterval);
                        setTimeout(() => { setVisited([]); setPath([]); step = 0; setIsSearching(true); }, 2500);
                    }
                }, 80);
            }
        }, 60); 
        
        return () => clearInterval(vInterval);
    }, [algo]);

    return (
        <div className="w-full max-w-[280px] mx-auto mt-4 mb-6">
            <div className="flex justify-between items-end mb-3">
                <div className="flex flex-col text-left font-mono text-[9px] tracking-widest text-slate-500 uppercase">
                    <span className="text-[#38BDF8] font-bold drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]">System Status</span>
                    <span>Algo : {algo}</span>
                    <span>Nodes: {visited.length} explored</span>
                    <span>State: {isSearching ? <span className="text-[#22D3EE] animate-pulse">Computing...</span> : <span className="text-emerald-400">Path Locked</span>}</span>
                </div>
            </div>

            <div className="flex justify-center gap-1 mb-4">
                {(['astar', 'dijkstra', 'greedy'] as const).map(a => (
                    <button 
                        key={a} onClick={() => setAlgo(a)}
                        className={`flex-1 text-[9px] font-mono font-bold py-1.5 rounded-[3px] transition-all uppercase tracking-widest border ${algo === a ? 'bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-transparent text-slate-500 border-white/5 hover:border-white/20 hover:text-slate-300'}`}
                    >
                        {a}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-8 gap-[2px] p-3 bg-[#060816]/80 backdrop-blur-md border border-white/5 rounded-lg shadow-inner relative overflow-hidden group">
                {Array.from({ length: 64 }).map((_, i) => {
                    const isTarget = i === 63;
                    const isStart = i === 0;
                    const isPath = path.includes(i);
                    const isVisited = visited.includes(i) && !isPath;

                    return (
                        <div 
                            key={i} 
                            className={`aspect-square rounded-[1px] transition-all duration-300 relative ${
                                isTarget ? 'bg-[#22D3EE] shadow-[0_0_10px_#22D3EE] z-20' 
                                : isStart ? 'bg-[#38BDF8] shadow-[0_0_10px_#38BDF8] z-20' 
                                : isPath ? 'bg-white shadow-[0_0_12px_#ffffff] z-10 scale-110' 
                                : isVisited ? 'bg-[#0F172A] border border-[#22D3EE]/40 shadow-[inset_0_0_5px_rgba(34,211,238,0.2)]' 
                                : 'bg-white/[0.02] border border-white/[0.02] group-hover:border-white/[0.05]' 
                            }`} 
                        />
                    )
                })}
            </div>
        </div>
    )
}