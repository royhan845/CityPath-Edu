"use client"

import { useSimulationStore } from "../../stores/useSimulationStore"
import { LayoutGrid, Route, Building2, Factory } from "lucide-react"

export default function TemplateSelector() {
    const { templateId, setTemplateId, executeClearBoard, playbackStatus } = useSimulationStore();

    // Templates Preset
    const templates = [
        { id: "empty", name: "Blank Canvas", icon: LayoutGrid, desc: "Inisiasi matriks kosong" },
        { id: "maze", name: "Labyrinth", icon: Route, desc: "Topologi rute kompleks" },
        { id: "urban", name: "Downtown", icon: Building2, desc: "Sektor urban padat" },
        { id: "industrial", name: "Industrial Zone", icon: Factory, desc: "Kawasan industrial" }
    ];

    const handleSelectTemplate = (id: string) => {
        if (id === templateId) return;
        executeClearBoard(); // Bersihkan sisa path/node sebelumnya
        
        // Beri jeda sedikit agar state React sempat reset sebelum me-load map baru
        setTimeout(() => {
            setTemplateId(id);
        }, 100);
    }

    return (
        <div className={`mt-6 ${playbackStatus !== 'idle' ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}`}>
            <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-3 block">
                Load Environment Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
                {templates.map((tpl) => {
                    const IconComponent = tpl.icon;
                    const isActive = templateId === tpl.id;
                    
                    return (
                        <button 
                            key={tpl.id} 
                            onClick={() => handleSelectTemplate(tpl.id)}
                            className={`flex flex-col items-start p-3 rounded-xl transition-all border ${
                                isActive 
                                ? 'bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.15)]' 
                                : 'bg-slate-800/30 border-white/5 hover:border-white/20 hover:bg-slate-800/50'
                            }`}
                        >
                            <div className={`mb-2 p-1.5 rounded-lg border ${
                                isActive 
                                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30' 
                                : 'bg-slate-900/50 text-slate-400 border-slate-700/50'
                            }`}>
                                <IconComponent size={16} />
                            </div>
                            <span className={`text-xs font-bold ${isActive ? 'text-cyan-400' : 'text-slate-200'}`}>
                                {tpl.name}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono mt-1 line-clamp-1 text-left">
                                {tpl.desc}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}