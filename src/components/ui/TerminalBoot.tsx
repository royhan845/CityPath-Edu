"use client"
import { useState, useEffect } from "react"

export default function TerminalBoot({ onComplete }: { onComplete: () => void }) {
    const [logs, setLogs] = useState<string[]>([]);
    
    useEffect(() => {
        const sequence = [
            { t: "[ SYS ] Mounting hex-spatial matrix...", delay: 200 },
            { t: "[ SYS ] Compiling heuristic nodes...", delay: 500 },
            { t: "[ SYS ] Injecting pathfinding engine...", delay: 900 },
            { t: "[ SYS ] Establishing telemetry link...", delay: 1300 },
            { t: "[ SYS ] Simulation environment active. // STABLE", delay: 1800 },
        ];

        sequence.forEach(({ t, delay }, i) => {
            setTimeout(() => {
                setLogs(prev => [...prev, t]);
                if (i === sequence.length - 1) setTimeout(onComplete, 600);
            }, delay);
        });
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-[#060816] z-[200] flex flex-col items-center justify-center p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.05),transparent_50%)]" />
            <div className="w-full max-w-xl text-left space-y-2 font-mono text-sm text-slate-500 relative z-10">
                {logs.map((log, i) => (
                    <div key={i} className="animate-in fade-in slide-in-from-bottom-2">
                        {log.includes('active') ? <span className="text-[#22D3EE] drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">{log}</span> : log}
                    </div>
                ))}
                <div className="w-2.5 h-4 bg-[#22D3EE] animate-pulse mt-2 shadow-[0_0_10px_#22D3EE]" /> 
            </div>
        </div>
    )
}