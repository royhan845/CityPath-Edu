"use client"

import { useSimulationStore } from "../../stores/useSimulationStore"

export default function TemplateSelector() {
    const { templateId, setTemplateId, executeClearBoard, playbackStatus } = useSimulationStore();

    // Template yang sudah di-upgrade!
    const templates = [
        { id: "empty", name: "Blank Canvas", icon: "🟩", desc: "Mulai dari nol" },
        { id: "maze", name: "Labyrinth", icon: "🌀", desc: "Uji jalan buntu & zig-zag" },
        { id: "urban", name: "Downtown", icon: "🏙️", desc: "Blok kota & jalanan padat" },
        { id: "industrial", name: "Industrial Zone", icon: "🏭", desc: "Kawasan pabrik & gudang" }
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
        <div className={`mt-6 ${playbackStatus !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-3 block">
                Load Environment Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
                {templates.map((tpl) => (
                    <button 
                        key={tpl.id} 
                        onClick={() => handleSelectTemplate(tpl.id)}
                        className={`flex flex-col items-start p-3 rounded-xl transition-all border ${
                            templateId === tpl.id 
                            ? 'bg-[#22D3EE]/10 border-[#22D3EE]/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                            : 'bg-[#0F172A]/50 border-white/5 hover:border-white/20 hover:bg-[#0F172A]/80'
                        }`}
                    >
                        <span className="text-xl mb-1">{tpl.icon}</span>
                        <span className={`text-xs font-bold ${templateId === tpl.id ? 'text-[#22D3EE]' : 'text-slate-200'}`}>
                            {tpl.name}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono mt-1 line-clamp-1 text-left">
                            {tpl.desc}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}