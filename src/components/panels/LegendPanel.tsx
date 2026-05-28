"use client"

import { useState } from "react"
import { Info, ChevronDown, ChevronUp } from "lucide-react"

export default function LegendPanel({ isMobile }: { isMobile: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    const legends = [
        { color: "bg-emerald-500", label: "Titik Awal", desc: "Start Node" },
        { color: "bg-rose-500", label: "Tujuan", desc: "Target Node" },
        { color: "bg-slate-500", label: "Rintangan", desc: "Obstacle/Wall" },
        { color: "bg-cyan-500", label: "Dievaluasi", desc: "Visited Node" },
        { color: "bg-yellow-400", label: "Rute Optimal", desc: "Shortest Path" },
    ];

    return (
        <div className={`absolute z-40 transition-all duration-500 ease-in-out
            ${isMobile 
                ? 'top-20 right-4 flex flex-col items-end' 
                : 'top-14 lg:top-20 left-1/2 -translate-x-1/2 w-full max-w-[300px] lg:max-w-max' 
            }
        `}>
            {/* Tombol Toggle HANYA muncul di Mobile (Vertikal) */}
            {isMobile && (
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-[#0f172a]/80 px-4 py-2.5 rounded-xl font-mono text-[10px] tracking-widest text-cyan-400 uppercase flex items-center gap-2 hover:bg-white/10 transition-colors border border-white/10 shadow-lg backdrop-blur-md relative z-10"
                >
                    <Info size={14} /> 
                    <span>Legenda</span>
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            )}

            {/* Isi Legenda */}
            <div className={`
                ${isMobile 
                    ? `mt-3 overflow-hidden transition-all duration-300 ease-in-out origin-top-right ${isOpen ? 'max-h-96 opacity-100 scale-100' : 'max-h-0 opacity-0 scale-95'} flex flex-col gap-3 bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-48` 
                    : `flex flex-row flex-wrap justify-center items-center gap-x-3 gap-y-2 lg:gap-6 bg-[#0f172a]/60 backdrop-blur-xl border border-white/10 px-4 lg:px-8 py-2 lg:py-3.5 rounded-xl lg:rounded-2xl shadow-lg`
                }
            `}>
                {legends.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 lg:gap-3">
                        <div className={`w-3 h-3 lg:w-4 lg:h-4 rounded-md shadow-[0_0_10px_rgba(255,255,255,0.1)] ${item.color} border border-white/20 shrink-0`}></div>
                        <div className="flex flex-col justify-center">
                            <span className="text-[8px] lg:text-[10px] font-bold text-slate-200 uppercase tracking-wider leading-none lg:mb-1">{item.label}</span>
                            <span className="hidden lg:block text-[7px] lg:text-[8px] font-mono text-slate-400 leading-none">{item.desc}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}