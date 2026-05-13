"use client"
import { useState } from 'react'

export default function TemplateSelector({ onSelectTemplate }: { onSelectTemplate: (id: string) => void }) {
    const [selectedId, setSelectedId] = useState<'empty' | 'small' | 'metro' | 'maze'>('empty');

    const handleSelect = (id: 'empty' | 'small' | 'metro' | 'maze') => {
        setSelectedId(id);
        onSelectTemplate(id);
    }

    const templates = [
        { id: 'empty', name: 'Kosong', image: '' },
        { id: 'small', name: 'Kota Kecil', image: 'https://images.unsplash.com/photo-1582281146747-d5d1c5d985a1?q=80&w=300&auto=format&fit=crop' },
        { id: 'metro', name: 'Metropolitan', image: 'https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?q=80&w=300&auto=format&fit=crop' },
        { id: 'maze', name: 'Labirin', image: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=300&auto=format&fit=crop' },
    ];

    // Komponen ini sekarang 100% mengisi lebar wadahnya (w-full), cocok ditaruh di sidebar
    return (
        <div className="w-full flex flex-col gap-3 mt-6 border-t border-slate-700/50 pt-5">
            <h3 className="text-slate-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Template Denah
            </h3>
            
            {/* Menggunakan Grid 2x2 agar ringkas di dalam sidebar */}
            <div className="grid grid-cols-2 gap-3">
                {templates.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => handleSelect(t.id as any)}
                        // aspect-[4/3] bikin gambarnya selalu proporsional meskipun layarnya mengecil
                        className={`group relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition-all duration-300 active:scale-95 flex items-end shadow-sm
                            ${selectedId === t.id 
                                ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                                : 'border-slate-700 hover:border-emerald-400/50 hover:-translate-y-0.5'
                            }`}
                    >
                        {/* --- BAGIAN GAMBAR --- */}
                        <div className="absolute inset-0 z-0">
                            {t.id === 'empty' ? (
                                <div className="w-full h-full bg-slate-800/40 flex items-center justify-center border border-slate-600 border-dashed m-1 rounded-lg">
                                    <span className="text-xl text-slate-500 font-bold">[]</span>
                                </div>
                            ) : (
                                <img 
                                    src={t.image} 
                                    alt={t.name} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                />
                            )}
                            {/* Gradasi gelap di bawah agar teks selalu terbaca */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                        </div>

                        {/* --- BAGIAN TEKS NAMA TEMPLATE --- */}
                        <div className="relative z-10 w-full p-2 text-left">
                            <p className="text-white text-[10px] sm:text-xs font-bold leading-tight truncate drop-shadow-md">
                                {t.name}
                            </p>
                        </div>

                        {/* --- INDIKATOR CENTANG --- */}
                        {selectedId === t.id && (
                            <div className="absolute top-1.5 right-1.5 z-20 bg-emerald-500 text-slate-950 w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] shadow-sm">
                                ✓
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}