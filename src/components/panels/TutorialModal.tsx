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
            {/* Background Overlay */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#050816]/70 backdrop-blur-sm" />

            {/* Glassmorphism Container */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-3xl bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.15)] rounded-3xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-5 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide">PANDUAN SISTEM</h2>
                        <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">CityPath Documentation</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"><X size={20} /></button>
                </div>

                {/* Body (Slider) */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={step}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                            className="flex flex-col md:flex-row gap-6 items-center"
                        >
                            {/* Video / Visual Asset */}
                            <div className="w-full md:w-3/5 bg-[#050816]/50 border border-white/10 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center shadow-inner">
                                <video 
                                    src={slides[step].video} 
                                    autoPlay loop muted playsInline 
                                    className="w-full h-full object-cover opacity-90"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                                <div className="absolute inset-0 flex items-center justify-center -z-10 text-slate-500">
                                    <span className="text-xs font-mono uppercase tracking-widest">Memuat Aset Visual...</span>
                                </div>
                            </div>

                            {/* Text Info */}
                            <div className="w-full md:w-2/5 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/5 rounded-xl border border-white/10 shadow-inner">{slides[step].icon}</div>
                                    <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase">Modul 0{step + 1}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-100">{slides[step].title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{slides[step].desc}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Navigasi */}
                <div className="p-5 border-t border-white/10 bg-white/5 flex justify-between items-center">
                    <div className="flex gap-2">
                        {slides.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'w-2 bg-white/20'}`} />
                        ))}
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={prevStep} 
                            disabled={step === 0}
                            className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        {step < slides.length - 1 ? (
                            <button 
                                onClick={nextStep}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 text-cyan-400 border border-white/10 hover:border-cyan-400/30 hover:bg-cyan-400/10 text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                Lanjut <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button 
                                onClick={onClose}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 text-[#0f172a] hover:bg-[#38bdf8] text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
                            >
                                Selesai
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}