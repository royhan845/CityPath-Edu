"use client"

import { useEffect, useState } from "react"
import { Smartphone } from "lucide-react"

export default function LandscapeWarning() {
    const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            const isLandscape = window.innerWidth > window.innerHeight;
            const isShortScreen = window.innerHeight < 600;
            
            setIsLandscapeMobile(isLandscape && isShortScreen);
        };

        checkOrientation();
        window.addEventListener("resize", checkOrientation);
        return () => window.removeEventListener("resize", checkOrientation);
    }, []);

    if (!isLandscapeMobile) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-[#050816]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-slate-700 rounded-[2rem] flex items-center justify-center relative">
                    <Smartphone size={32} className="text-cyan-400 absolute transition-transform duration-1000 -rotate-90 animate-[pulse_2s_infinite]" />
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-100 mb-3 tracking-wide">
                Mode Layar Tidak Didukung
            </h2>
            
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                Aplikasi ini membutuhkan ruang vertikal yang optimal. Silakan putar kembali perangkat Anda ke mode <strong className="text-cyan-400">Portrait (Berdiri)</strong> untuk melanjutkan.
            </p>
        </div>
    )
}