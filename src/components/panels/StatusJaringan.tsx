"use client"

import { useState, useEffect } from 'react'
import { WifiOff, AlertCircle } from 'lucide-react'

export default function StatusJaringan() {
    const [isOffline, setIsOffline] = useState(false)

    useEffect(() => {
        // Cek status saat load
        setIsOffline(!navigator.onLine)

        const handleOffline = () => setIsOffline(true)
        const handleOnline = () => setIsOffline(false)

        window.addEventListener('offline', handleOffline)
        window.addEventListener('online', handleOnline)

        return () => {
            window.removeEventListener('offline', handleOffline)
            window.removeEventListener('online', handleOnline)
        }
    }, [])

    if (!isOffline) return null

    return (
        <div className="fixed inset-0 z-[9999] bg-[#050816]/90 backdrop-blur-xl flex items-center justify-center p-6 text-center">
            <div className="bg-[#0B1120] border border-slate-800/80 p-8 rounded-3xl max-w-sm shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-rose-500/10 rounded-2xl">
                        <WifiOff size={40} className="text-rose-500 animate-pulse" />
                    </div>
                </div>
                
                <h2 className="text-lg font-bold text-white mb-2 tracking-wide uppercase font-mono">Sinyal Terputus</h2>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                    Koneksi ke CityPath terputus. Sistem tetap berjalan dalam mode lokal, namun data tidak akan tersinkronisasi.
                </p>
                
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono uppercase tracking-widest border-t border-slate-800 pt-4">
                    <AlertCircle size={12} />
                    <span>Mencoba Menghubungkan Kembali...</span>
                </div>
            </div>
        </div>
    )
}