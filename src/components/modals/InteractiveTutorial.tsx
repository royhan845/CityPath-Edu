"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cpu, Target, BoxSelect, PlayCircle, BarChart2, CheckCircle2, ChevronRight, X, Layers, Hand } from "lucide-react"
import { useSimulationStore } from "../../stores/useSimulationStore"

interface InteractiveTutorialProps {
    onClose: () => void;
}

export default function InteractiveTutorial({ onClose }: InteractiveTutorialProps) {
    const { tutorialStep, setTutorialStep, setShowTutorial, setMobileMenuOpen, showTutorial } = useSimulationStore();
    
    const [mounted, setMounted] = useState(false);
    const [isMobileDevice, setIsMobileDevice] = useState(true);

    useEffect(() => {
        setMounted(true);
        const handleResize = () => setIsMobileDevice(window.innerWidth <= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setShowTutorial(true);
        return () => {
            setShowTutorial(false);
            setMobileMenuOpen(null); 
        };
    }, [setShowTutorial, setMobileMenuOpen]);

    useEffect(() => {
        if ([2, 3].includes(tutorialStep)) setMobileMenuOpen('editor');
        else if ([4, 6].includes(tutorialStep)) setMobileMenuOpen('metrics');
        else setMobileMenuOpen(null); 
    }, [tutorialStep, setMobileMenuOpen]);

    const rawSteps = [
        { id: 0, title: "SYSTEM INITIALIZED", desc: "Selamat datang di CityPath Edu! Ini adalah arena 3D tempat mesin algoritmamu akan berpikir. Mari kita mulai orientasi ini.", icon: <Cpu className="text-cyan-400" size={24} />, position: "center" },
        { id: 1, title: "MODE INTERAKSI", desc: "PENTING: Perhatikan dua ikon di sudut kiri atas layar! Gunakan mode 'Kamera' untuk menggeser sudut pandang, dan mode 'Tangan' untuk mulai membangun di Grid.", icon: <Hand className="text-cyan-400" size={24} />, position: "top-left" },
        { id: 2, title: "ENTITAS SPASIAL", desc: "Di panel ini kamu bisa memilih bentuk rintangan/bangunan untuk diletakkan di atas Grid 3D. Kamu juga bisa menggunakan rute Template otomatis.", icon: <BoxSelect className="text-cyan-400" size={24} />, position: "left" },
        { id: 3, title: "MODUL NAVIGASI", desc: "Gunakan alat ini untuk mengatur Titik Awal (A) dan Tujuan (B). Kamu juga bisa menghapus atau merotasi bangunan menggunakan menu ini.", icon: <Layers className="text-blue-400" size={24} />, position: "left-lower" },
        { id: 4, title: "ALGORITHM CORE", desc: "Di panel kanan ini, kamu bisa mengganti 'Otak Mesin' (Algoritma) seperti A-Star, Dijkstra, atau BFS untuk mengubah gaya pencarian jalan.", icon: <Target className="text-emerald-400" size={24} />, position: "right" },
        { id: 5, title: "PLAYBACK CONTROLS", desc: "Setelah semuanya diatur, klik tombol ▶ Execute di bawah untuk melihat mesin bekerja mencari jalan tercepat secara real-time!", icon: <PlayCircle className="text-amber-400" size={24} />, position: "bottom" },
        { id: 6, title: "PERFORMANCE MATRIX", desc: "Setelah simulasi selesai, klik tombol Analytics ini untuk membandingkan performa setiap algoritma. Silakan klik 'Selesai' untuk mulai mencoba sendiri!", icon: <BarChart2 className="text-purple-400" size={24} />, position: "bottom-right" }
    ];

    const activeSteps = rawSteps.filter(s => isMobileDevice ? true : s.id !== 1);
    
    const currentIndex = activeSteps.findIndex(s => s.id === tutorialStep);
    const currentData = activeSteps[currentIndex] || activeSteps[0];
    const isLastStep = currentIndex === activeSteps.length - 1;

    const handleNext = () => { if (isLastStep) finishTutorial(); else setTutorialStep(activeSteps[currentIndex + 1].id); };
    const handlePrev = () => { if (currentIndex > 0) setTutorialStep(activeSteps[currentIndex - 1].id); };
    const finishTutorial = () => { localStorage.setItem('citypath_has_seen_tutorial', 'true'); onClose(); setTimeout(() => setTutorialStep(0), 500); };

    const getPositionClasses = (pos: string) => {
        const baseMobile = "top-24 left-1/2 -translate-x-1/2";
        switch (pos) {
            case "top-left": return `top-28 left-4 md:top-24 md:left-6 md:translate-x-0`; // Posisi Kiri Atas
            case "left": return `${baseMobile} md:top-1/4 md:left-[310px] lg:left-[380px] md:translate-x-0`;
            case "left-lower": return `${baseMobile} md:top-[45%] md:left-[310px] lg:left-[380px] md:translate-x-0`;
            case "right": return `${baseMobile} md:top-24 md:left-auto md:right-[310px] lg:right-[380px] md:translate-x-0`;
            case "bottom": return `bottom-[240px] left-1/2 -translate-x-1/2 md:top-auto md:bottom-[160px]`;
            case "bottom-right": return `${baseMobile} md:top-auto md:bottom-[200px] md:left-auto md:right-[310px] lg:right-[380px] md:translate-x-0`;
            case "center": default: return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
        }
    };

    if (!mounted) return null;

    return (
        <>
            <AnimatePresence>
                {showTutorial && (
                    <motion.div 
                        key="tutorial-backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[#050816]/70 backdrop-blur-[3px] z-[990] pointer-events-auto"
                    />
                )}
            </AnimatePresence>

            <div className="fixed inset-0 z-[1000] pointer-events-none">
                <AnimatePresence mode="wait">
                    {currentData && (
                        <motion.div
                            key={`dialog-${tutorialStep}`}
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className={`absolute pointer-events-auto w-[92%] max-w-[340px] bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.6)] flex flex-col ${getPositionClasses(currentData.position)}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 border border-white/10 rounded-xl shadow-inner">
                                        {currentData.icon}
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">
                                            Tahap {currentIndex + 1} / {activeSteps.length}
                                        </span>
                                        <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wider">
                                            {currentData.title}
                                        </h3>
                                    </div>
                                </div>
                                <button onClick={finishTutorial} className="text-slate-500 hover:text-rose-400 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-xs text-slate-300 leading-relaxed font-mono mb-5 border-l-2 border-white/10 pl-3">
                                {currentData.desc}
                            </p>

                            <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                                <button onClick={finishTutorial} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-slate-200 transition-colors">
                                    Skip
                                </button>
                                
                                <div className="flex items-center gap-2">
                                    {currentIndex > 0 && (
                                        <button onClick={handlePrev} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-slate-200">
                                            <ChevronRight size={14} className="rotate-180" /> Prev
                                        </button>
                                    )}

                                    <button onClick={handleNext} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-inner border ${isLastStep ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.3)]' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]'}`}>
                                        {isLastStep ? <>Selesai <CheckCircle2 size={14} /></> : <>Lanjut <ChevronRight size={14} /></>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}