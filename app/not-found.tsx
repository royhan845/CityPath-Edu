import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden font-sans">
            
            {/* --- EFEK BACKGROUND GRID CITYPATH --- */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 z-0"></div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-6">
                
                {/* --- BADGE ERROR (Sedikit lebih mungil) --- */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6 shadow-inner animate-fade-in-down">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span className="text-[10px] sm:text-xs font-bold text-rose-400 tracking-wider uppercase">Sistem Spasial Terputus</span>
                </div>

                {/* --- AREA TIPOGRAFI & VIDEO MONSTER --- */}
                <div className="relative flex items-center justify-center w-full h-[16rem] md:h-[20rem]">
                    
                    {/* Teks 404 Dikecilkan agar proporsional */}
                    <h1 className="absolute text-[8rem] md:text-[13rem] font-black text-slate-800/80 select-none tracking-tighter z-0 drop-shadow-[0_0_30px_rgba(30,41,59,0.8)]">
                        404
                    </h1>

                    {/* WADAH VIDEO MONSTER */}
                    <div className="relative z-10 w-full max-w-xs md:max-w-sm h-full flex items-end justify-center pointer-events-none">
                        <video 
                            src="/video/404anim.webm" 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            style={{
                                WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                                maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                            }}
                            className="w-full h-full object-contain -translate-y-2" 
                        />
                    </div>
                </div>

                {/* --- TEKS INFORMASI --- */}
                <div className="text-center relative z-20 -mt-12 md:-mt-16">
                    <h2 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3 drop-shadow-md">
                        Sektor Tidak Ditemukan
                    </h2>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-md mx-auto font-medium bg-slate-950/80 rounded-lg p-2 backdrop-blur-sm">
                        Karakter kita kehilangan arah. Titik koordinat yang kamu tuju berada di luar jangkauan peta atau telah dihapus dari sistem simulasi.
                    </p>

                    {/* --- TOMBOL KEMBALI --- */}
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 md:py-3.5 md:px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95 border border-emerald-400/50 group text-sm md:text-base"
                    >
                        <span className="text-lg leading-none group-hover:-translate-x-1 transition-transform">‹</span> 
                        Kembali ke Peta Utama
                    </Link>
                </div>

            </div>
        </div>
    )
}