"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, Map, Crosshair, Cpu } from "lucide-react"

export default function TutorialModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(0);

    const slides = [
        { 
            title: "Konfigurasi Matriks Spasial", 
            desc: "Desain topologi rintangan pada lingkungan virtual. Semakin kompleks struktur kota yang dibangun, semakin tinggi beban komputasi navigasi.", 
            icon: <Map size={24} className="text-cyan-400" />,
            video: "./video/Konfigurasi Environment.mp4" 
        },
        { 
            title: "Penempatan Entitas Target", 
            desc: "Aktifkan instrumen 'Titik Awal' (A) atau 'Titik Tujuan' (B) pada panel kiri, lalu distribusikan di area kosong pada grid untuk menentukan rute.", 
            icon: <Crosshair size={24} className="text-emerald-400" />,
            video: "./video/tutorial-2.mp4" 
        },
        { 
            title: "Eksekusi & Analisis Komparatif", 
            desc: "Pilih mesin algoritma pada panel kanan, jalankan simulasi, lalu buka Performance Analytics untuk membandingkan efisiensi ruang dan waktu.", 
            icon: <Cpu size={24} className="text-amber-400" />,
            video: "./video/tutorial-3.mp4" 
        }
    ];

    const nextStep = () => setStep(s => Math.min(s + 1, slides.length - 1));
    const prevStep = () => setStep(s => Math.max(s - 1, 0));

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#060816]/90 backdrop-blur-md" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-3xl bg-[#0B1120] border border-slate-700/60 shadow-[0_0_50px_rgba(34,211,238,0.1)] rounded-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide">PANDUAN SISTEM</h2>
                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">CityPath Documentation</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-400 transition-colors"><X size={20} /></button>
                </div>

                {/* Body (Slider) */}
                <div className="p-6 bg-[#050816]/50">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={step}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                            className="flex flex-col md:flex-row gap-6 items-center"
                        >
                            {/* Video / Visual Asset */}
                            <div className="w-full md:w-3/5 bg-[#0B1120] border border-slate-800 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center shadow-inner">
                                <video 
                                    src={slides[step].video} 
                                    autoPlay loop muted playsInline 
                                    className="w-full h-full object-cover opacity-80"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                {/* Fallback jika video gagal dimuat */}
                                <div className="absolute inset-0 flex items-center justify-center -z-10 text-slate-700">
                                    <span className="text-xs font-mono uppercase tracking-widest">Memuat Aset Visual...</span>
                                </div>
                            </div>

                            {/* Text Info */}
                            <div className="w-full md:w-2/5 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">{slides[step].icon}</div>
                                    <span className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase">Modul 0{step + 1}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-200">{slides[step].title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{slides[step].desc}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Navigasi */}
                <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <div className="flex gap-1.5">
                        {slides.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700'}`} />
                        ))}
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={prevStep} 
                            disabled={step === 0}
                            className="p-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        {step < slides.length - 1 ? (
                            <button 
                                onClick={nextStep}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                Lanjut <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button 
                                onClick={onClose}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 text-[#050816] hover:bg-emerald-400 text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            >
                                Mulai Simulasi
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}