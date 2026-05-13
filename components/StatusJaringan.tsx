"use client"
import { useState, useEffect } from 'react'

export default function StatusJaringan() {
    const [isOffline, setIsOffline] = useState(false)

    useEffect(() => {
        // Update status awal
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
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 text-center">
            <div className="bg-slate-900 border border-rose-500/30 p-8 rounded-3xl max-w-sm shadow-2xl shadow-rose-500/10">
                <div className="text-5xl mb-4 animate-pulse">📡</div>
                <h2 className="text-xl font-bold text-white mb-2">Sinyal Terputus</h2>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Koneksi ke CityPath hilang. Kamu masih bisa menggunakan fitur lokal, tapi data mungkin tidak tersinkronisasi.
                </p>
                <div className="flex gap-2 justify-center">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-300"></div>
                </div>
            </div>
        </div>
    )
}