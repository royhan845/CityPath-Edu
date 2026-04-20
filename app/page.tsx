"use client"

import { useState, useEffect } from "react"
import Scene from "@/components/Scene";

export default function Home() {
    const [isSimulating, setIsSimulating] = useState(false);

    // Mencegah body scrolling saat modal/simulator terbuka (opsional tapi bagus untuk UX)
    useEffect(() => {
        if (isSimulating) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isSimulating]);

    if (isSimulating) {
        return (
            <div className="fixed inset-0 w-full h-screen animate-in fade-in duration-700 bg-slate-900 z-50">
                {/* Tombol Keluar Bergaya Pill (Modern) */}
                <button 
                    onClick={() => setIsSimulating(false)}
                    className="group absolute top-6 right-6 z-50 bg-slate-900/60 hover:bg-rose-500/90 text-slate-200 hover:text-white px-6 py-3 rounded-full font-bold backdrop-blur-xl border border-slate-700/50 hover:border-rose-400/50 transition-all duration-300 shadow-2xl flex items-center gap-3"
                >
                    <span className="bg-slate-700 group-hover:bg-rose-600 text-[10px] w-6 h-6 flex items-center justify-center rounded-full transition-colors">
                        ✖
                    </span> 
                    Keluar Simulasi
                </button>
                <Scene />
            </div>
        )
    }

    return (
        // LAPISAN 1: Pengunci layar penuh, memaksa overflow horizontal mati total
        <div className="w-full min-h-screen overflow-x-hidden bg-[#fafcff] text-slate-800 font-sans selection:bg-emerald-200 relative scroll-smooth">
            
            {/* LAPISAN 2: Penampung konten sesungguhnya yang tidak akan bisa jebol ke samping */}
            <div className="w-full max-w-[100vw] overflow-hidden">
                
                {/* Latar Belakang Pola Grid & Cahaya Ethereal */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-400/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

                {/* --- HEADER (Frosted Glass) --- */}
                <header className="bg-white/60 backdrop-blur-xl border-b border-slate-200/50 py-4 px-8 sticky top-0 z-50 flex justify-between items-center transition-all w-full">
                    <div className="font-black text-2xl text-slate-900 flex items-center gap-2 tracking-tight">
                        <span className="drop-shadow-md">🏙️</span> CityPath<span className="text-emerald-500">Edu</span>
                    </div>
                    <nav className="hidden md:flex gap-8 font-bold text-sm text-slate-500">
                        <a href="#teori" className="hover:text-emerald-500 transition-colors py-1">Teori Algoritma</a>
                        <a href="#cara-kerja" className="hover:text-emerald-500 transition-colors py-1">Cara Kerja</a>
                    </nav>
                </header>

                {/* --- HERO SECTION --- */}
                <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 lg:py-32 flex flex-col md:flex-row items-center gap-16 box-border">
                    <div className="flex-1 space-y-8 text-center md:text-left w-full">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-3 bg-white border border-emerald-100 text-emerald-700 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-2 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            Visualisasi 3D Interaktif
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] text-slate-900 tracking-tighter">
                            Pahami Algoritma <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 drop-shadow-sm">
                                Tanpa Pusing.
                            </span>
                        </h1>
                        
                        <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto md:mx-0 font-medium">
                            Belajar bagaimana Google Maps mencari jalan tercepat menggunakan algoritma <b>Dijkstra, A*, BFS, hingga DFS</b> secara visual dalam bentuk kota 3D yang bisa kamu bangun sendiri.
                        </p>
                        
                        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full">
                            <button 
                                onClick={() => setIsSimulating(true)}
                                className="group relative bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] transition-all active:scale-95 flex items-center justify-center gap-3 text-lg overflow-hidden border border-slate-700 w-full sm:w-auto"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="group-hover:-translate-y-1 transition-transform relative z-10">🚀</span> 
                                <span className="relative z-10">Masuk ke Simulator</span>
                            </button>
                            <a href="#teori" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-8 py-4 rounded-2xl transition-all shadow-sm hover:shadow-md flex items-center justify-center w-full sm:w-auto">
                                Pelajari Teorinya
                            </a>
                        </div>
                    </div>

                    {/* Hero Image / Screenshot */}
                    <div className="flex-1 w-full max-w-xl md:max-w-none relative group perspective-1000 mx-auto">
                        <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-400 to-cyan-400 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
                        <div className="relative aspect-square bg-white rounded-[3rem] overflow-hidden shadow-2xl border-[10px] border-white flex items-center justify-center transform transition-transform duration-700 group-hover:rotate-1 group-hover:scale-[1.02]">
                            <img 
                                src="/images/image.png" 
                                alt="Preview City Editor" 
                                className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                            />
                        </div>
                    </div>
                </main>

                {/* --- CARA KERJA SECTION --- */}
                <section id="cara-kerja" className="relative z-10 w-full bg-white border-y border-slate-100 py-24 px-6 box-border">
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="text-center space-y-4 mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">3 Langkah Mudah</h2>
                            <p className="text-slate-500 text-lg font-medium">Cara menggunakan CityPath Edu</p>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 w-full">
                            {[
                                { step: "1", title: "Bangun Kotamu", desc: "Gunakan katalog bangunan di sebelah kiri untuk menyusun rintangan dan jalan di atas grid." },
                                { step: "2", title: "Atur Posisi", desc: "Letakkan karakter Polisi (Start) dan titik tujuan (End) di tempat yang menantang." },
                                { step: "3", title: "Visualisasikan", desc: "Pilih algoritmanya, tekan tombol Visualize, dan saksikan bagaimana komputer berpikir!" }
                            ].map((item, idx) => (
                                <div key={idx} className="bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1 group w-full">
                                    <div className="w-16 h-16 bg-white border border-slate-200 text-emerald-500 font-black text-2xl rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                        {item.step}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">{item.title}</h3>
                                    <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- EDUKASI SECTION (Dark Mode) --- */}
                <section id="teori" className="relative z-10 w-full bg-[#0B1120] text-white py-32 px-6 overflow-hidden box-border">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-full bg-[radial-gradient(ellipse_at_top_center,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none"></div>
                    <div className="absolute inset-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-7xl mx-auto space-y-20">
                        <div className="text-center space-y-6 px-4">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">Mengenal Otak di Balik Layar</h2>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Setiap algoritma memiliki kepribadian dan cara berpikirnya masing-masing. Mana yang paling efisien?</p>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 lg:gap-8 w-full">
                            {/* Card Dijkstra */}
                            <div className="group w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-22px)] bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(6,182,212,0.1)]">
                                <div className="w-14 h-14 bg-cyan-950/50 text-cyan-400 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-cyan-900/50 group-hover:scale-110 transition-transform">🌊</div>
                                <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-cyan-400 transition-colors tracking-tight">Dijkstra's Algorithm</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Menyebar rata ke segala arah. <b>Pasti menemukan jalan terpendek</b>, tapi lambat karena memeriksa terlalu banyak area yang tidak perlu.</p>
                            </div>

                            {/* Card A-Star */}
                            <div className="group w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-22px)] bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)]">
                                <div className="w-14 h-14 bg-emerald-950/50 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-emerald-900/50 group-hover:scale-110 transition-transform">🎯</div>
                                <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-emerald-400 transition-colors tracking-tight">A* (A-Star) Search</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Sangat cerdas. Menggunakan insting "Heuristik" untuk memprioritaskan arah target. <b>Sangat cepat dan menjamin jalan terpendek.</b></p>
                            </div>

                            {/* Card Greedy */}
                            <div className="group w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-22px)] bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-slate-800 hover:border-yellow-500/50 hover:bg-slate-800/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(234,179,8,0.1)]">
                                <div className="w-14 h-14 bg-yellow-950/50 text-yellow-400 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-yellow-900/50 group-hover:scale-110 transition-transform">🏃‍♂️</div>
                                <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-yellow-400 transition-colors tracking-tight">Greedy Best-First</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">"Nafsu" menuju arah target secepat mungkin tanpa mempedulikan rute lain. Cepat, tapi <b>sering terjebak</b> pada rintangan "U".</p>
                            </div>

                            {/* Card BFS */}
                            <div className="group w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-22px)] max-w-sm bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(59,130,246,0.1)]">
                                <div className="w-14 h-14 bg-blue-950/50 text-blue-400 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-blue-900/50 group-hover:scale-110 transition-transform">⭕</div>
                                <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-blue-400 transition-colors tracking-tight">Breadth-First (BFS)</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Menjelajah berlapis seperti riak air. Menjamin jalur terpendek, sangat andal pada peta kosong tanpa bobot jarak.</p>
                            </div>

                            {/* Card DFS */}
                            <div className="group w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-22px)] max-w-sm bg-slate-900/50 backdrop-blur-md p-8 rounded-3xl border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800/80 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(244,63,94,0.1)]">
                                <div className="w-14 h-14 bg-rose-950/50 text-rose-400 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-rose-900/50 group-hover:scale-110 transition-transform">⛏️</div>
                                <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-rose-400 transition-colors tracking-tight">Depth-First (DFS)</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Menelusuri satu lorong sedalam-dalamnya secara acak. Sangat buruk untuk mencari jalan terpendek, tapi <b>bagus untuk labirin</b>.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- FOOTER --- */}
                <footer className="w-full bg-[#0B1120] text-slate-500 py-10 text-center text-sm border-t border-slate-800/50 relative z-10 box-border">
                    <p className="font-medium tracking-wide">© {new Date().getFullYear()} CityPath Edu. Dibangun dengan <span className="text-rose-500">♥</span> untuk Edukasi.</p>
                </footer>
            </div>
        </div>
    )
}