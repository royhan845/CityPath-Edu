"use client"

import { useState, useEffect } from "react"
import Scene from "@/components/Scene";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Sphere, MeshDistortMaterial } from "@react-three/drei";

// --- MINI PREVIEW COMPONENT ---
const HologramShowcase = () => {
    return (
        <Canvas camera={{ position: [3, 3, 4], fov: 45 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[10, 10, 10]} intensity={2} />
            <OrbitControls autoRotate autoRotateSpeed={1} enableZoom={false} enablePan={false} />
            <Float speed={3} rotationIntensity={1} floatIntensity={2}>
                <group>
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[1.5, 1.5, 1.5]} />
                        <meshStandardMaterial color="#06b6d4" wireframe transparent opacity={0.3} />
                    </mesh>
                    <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
                        <MeshDistortMaterial color="#10b981" speed={2} distort={0.4} />
                    </Sphere>
                    {[[-1.2, 1, 0.5], [1.2, -0.8, -0.5], [0.5, 1.2, -1], [-0.5, -1.2, 1]].map((pos, i) => (
                        <mesh key={i} position={pos as [number, number, number]}>
                            <sphereGeometry args={[0.1, 16, 16]} />
                            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
                        </mesh>
                    ))}
                </group>
            </Float>
        </Canvas>
    )
}

export default function Home() {
    const [isSimulating, setIsSimulating] = useState(false);
    const [sceneMode, setSceneMode] = useState<'tutorial' | 'report'>('tutorial');

    useEffect(() => {
        if (isSimulating) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isSimulating]);

    const handleLaunch = (mode: 'tutorial' | 'report') => {
        setSceneMode(mode);
        setIsSimulating(true);
    };

    const [previewHistory, setPreviewHistory] = useState<{algo: string, visited: number, path: number, time: number}[]>([]);

    useEffect(() => {
        const savedHistory = sessionStorage.getItem('citypath_history');
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                setPreviewHistory(parsed.slice(-3)); 
            } catch (e) { }
        }
    }, [isSimulating]);

    const algoMap: Record<string, { title: string, color: string }> = {
        astar: { title: "A* Search", color: "text-emerald-400" },
        greedy: { title: "Greedy BFS", color: "text-yellow-400" },
        dijkstra: { title: "Dijkstra", color: "text-cyan-400" },
        bfs: { title: "Breadth-First", color: "text-blue-400" },
        dfs: { title: "Depth-First", color: "text-rose-400" }
    };

    if (isSimulating) {
        return (
            <div className="fixed inset-0 w-full h-[100dvh] animate-in fade-in duration-700 bg-[#050816] z-50">
                <button 
                    onClick={() => setIsSimulating(false)}
                    className="group absolute top-6 right-6 z-[100] bg-slate-900/80 hover:bg-rose-500/90 text-slate-200 hover:text-white px-6 py-3 rounded-full font-bold backdrop-blur-xl border border-slate-700/50 transition-all duration-300 shadow-2xl flex items-center gap-3"
                >
                    <span className="bg-slate-700 group-hover:bg-rose-600 text-[10px] w-6 h-6 flex items-center justify-center rounded-full">✖</span> 
                    Keluar Simulator
                </button>
                {/* Mengirim mode ke dalam Scene */}
                <Scene initialMode={sceneMode} />
            </div>
        )
    }

    return (
        <div className="w-full bg-[#050816] text-slate-300 font-sans selection:bg-cyan-500/30 scroll-smooth">
            
            <header className="fixed top-0 z-[100] w-full bg-[#050816]/70 backdrop-blur-md border-b border-slate-800/50 py-4 px-8 flex justify-between items-center transition-all">
                <div className="font-black text-xl text-white flex items-center gap-2 tracking-tighter">
                    <span className="text-cyan-500 text-2xl">🏙️</span> CityPath<span className="text-cyan-500">Edu</span>
                </div>
                <nav className="hidden md:flex gap-10 font-bold text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How it works</a>
                    <a href="#algorithms" className="hover:text-cyan-400 transition-colors">Algorithms</a>
                    <a href="#benefits" className="hover:text-cyan-400 transition-colors">Context</a>
                </nav>
                {/* UPDATE TOMBOL */}
                <button onClick={() => handleLaunch('tutorial')} className="bg-cyan-500 hover:bg-cyan-400 text-[#050816] px-5 py-2 rounded-full text-xs font-black transition-all active:scale-95">
                    LAUNCH SIMULATOR
                </button>
            </header>

            <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 min-h-screen">
                <div className="flex-1 space-y-8 text-center lg:text-left z-10">
                    <div className="inline-flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        Interactive 3D Module
                    </div>
                    
                    <h1 className="text-5xl lg:text-7xl font-black leading-[1] text-white tracking-tighter">
                        Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500">Pathfinding</span> Logic in 3D Space.
                    </h1>
                    
                    <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                        Platform edukasi interaktif untuk memvisualisasikan algoritma navigasi cerdas. Pelajari bagaimana AI menentukan rute paling efisien melalui topologi arsitektur yang kompleks.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                        {/* UPDATE TOMBOL */}
                        <button 
                            onClick={() => handleLaunch('tutorial')}
                            className="group bg-white hover:bg-cyan-400 text-[#050816] font-black px-10 py-5 rounded-2xl shadow-[0_20px_50px_rgba(6,182,212,0.2)] transition-all active:scale-95 flex items-center justify-center gap-3 text-sm"
                        >
                            START VISUALIZATION <span className="group-hover:translate-x-1 transition-transform">🚀</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-slate-800/50">
                        {[
                            { label: "Algorithms", val: "5+" },
                            { label: "Interactive", val: "Yes" },
                            { label: "3D Engine", val: "R3F" },
                            { label: "Educational", val: "Active" }
                        ].map((s, i) => (
                            <div key={i}>
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{s.label}</p>
                                <p className="text-xl font-black text-white">{s.val}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 w-full aspect-square max-w-[600px] relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-[120px] rounded-full"></div>
                    <HologramShowcase />
                </div>
            </main>

            <section id="how-it-works" className="py-32 px-6 bg-[#0B1120]/30 border-y border-slate-800/50">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">Sistem Kerja Simulasi</h2>
                    <p className="text-slate-500 mb-20 max-w-2xl mx-auto font-medium">Metodologi transformasi rintangan spasial menjadi data komputasi yang terukur.</p>
                    
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: "01", t: "Scan Environment", d: "Sistem membaca topologi gedung dan rintangan di grid 3D." },
                            { step: "02", t: "Generate Nodes", d: "Area navigasi diubah menjadi struktur graph (Node & Edge)." },
                            { step: "03", t: "Find Optimal Path", d: "Algoritma mengevaluasi cost (F, G, H) untuk mencari jalur." },
                            { step: "04", t: "Visualize Result", d: "Karakter bergerak mengikuti koordinat hasil pathfinding." }
                        ].map((item, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-[#0B1120] border border-slate-800 hover:border-cyan-500/50 transition-all">
                                <span className="text-5xl font-black text-slate-800 group-hover:text-cyan-500/20 transition-colors block mb-6">{item.step}</span>
                                <h3 className="text-lg font-bold text-white mb-2">{item.t}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="algorithms" className="py-32 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="flex-1">
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-6">Mendukung Berbagai Metode Pencarian.</h2>
                        <p className="text-slate-400 mb-8 leading-relaxed font-medium">Bandingkan efisiensi algoritma klasik hingga modern dalam satu dashboard terpadu.</p>
                        
                        <div className="space-y-4">
                            {[
                                { name: "A* Search", feat: "Cepat & Optimal (Heuristik)" },
                                { name: "Dijkstra", feat: "Akurasi Absolut (Radial)" },
                                { name: "Greedy BFS", feat: "Kecepatan Maksimal (Prioritas)" },
                                { name: "Breadth-First", feat: "Ideal untuk Labirin Tanpa Bobot" }
                            ].map((a, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                    <span className="font-bold text-white">{a.name}</span>
                                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">{a.feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 w-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-1 rounded-[3rem] border border-slate-800 overflow-hidden">
                        <div className="bg-[#050816] rounded-[2.8rem] p-10 h-full flex flex-col justify-center items-center text-center">
                            <span className="text-6xl mb-6">📊</span>
                            <h3 className="text-2xl font-black text-white mb-4">Comparison Engine</h3>
                            <p className="text-sm text-slate-500 mb-8">Fitur perbandingan real-time memungkinkan Anda melihat perbedaan waktu eksekusi dan memori yang digunakan secara side-by-side.</p>
                            
                            {/* --- PREVIEW TABEL SKELETON (Estetik Futuristik) --- */}
                            <div className="w-full border border-slate-800/80 rounded-2xl overflow-hidden bg-[#0B1120]/50 mb-8 shadow-inner">
                                <div className="bg-[#0B1120] py-2.5 px-4 border-b border-slate-800/80 grid grid-cols-12 gap-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center">
                                    <div className="col-span-5 text-left">Algoritma</div>
                                    <div className="col-span-2">Blok</div>
                                    <div className="col-span-2">Rute</div>
                                    <div className="col-span-3 text-right">Waktu</div>
                                </div>
                                <div className="p-3 space-y-2">
                                    {/* Baris Kosong 1 */}
                                    <div className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl text-xs border border-dashed border-slate-700/50 bg-slate-800/10 opacity-60">
                                        <div className="col-span-5 flex items-center gap-2 text-left">
                                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                                            <div className="h-2 w-16 bg-slate-700 rounded-full"></div>
                                        </div>
                                        <div className="col-span-2 text-center text-slate-600 font-mono">-</div>
                                        <div className="col-span-2 text-center text-slate-600 font-mono">-</div>
                                        <div className="col-span-3 text-right text-slate-600 font-mono">-</div>
                                    </div>
                                    {/* Baris Kosong 2 */}
                                    <div className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl text-xs border border-dashed border-slate-700/50 bg-slate-800/10 opacity-40">
                                        <div className="col-span-5 flex items-center gap-2 text-left">
                                            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                            <div className="h-2 w-12 bg-slate-700 rounded-full"></div>
                                        </div>
                                        <div className="col-span-2 text-center text-slate-700 font-mono">-</div>
                                        <div className="col-span-2 text-center text-slate-700 font-mono">-</div>
                                        <div className="col-span-3 text-right text-slate-700 font-mono">-</div>
                                    </div>
                                </div>
                            </div>

                            {/* UPDATE TOMBOL DAN TEKS */}
                            <button onClick={() => handleLaunch('report')} className="group text-cyan-400 font-bold text-xs tracking-widest uppercase flex items-center gap-2 transition-all hover:text-cyan-300">
                                Bandingkan Performa <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section id="benefits" className="py-32 px-6 bg-white text-[#050816] rounded-[3rem] mx-4 mb-20 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-8">Why Learn <br />Pathfinding?</h2>
                        <p className="text-lg font-medium opacity-70 leading-relaxed">
                            Algoritma ini adalah fondasi dari teknologi masa depan. Memahaminya berarti memahami bagaimana dunia bergerak secara otomatis.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { i: "🤖", t: "Robotics", d: "Navigasi robot industri." },
                            { i: "🎮", t: "Game AI", d: "Pergerakan NPC cerdas." },
                            { i: "🛰️", t: "GPS System", d: "Optimasi rute perjalanan." },
                            { i: "🚗", t: "Self-Driving", d: "Logika kendali otonom." }
                        ].map((b, idx) => (
                            <div key={idx} className="p-6 bg-slate-100 rounded-3xl border border-slate-200">
                                <span className="text-3xl block mb-4">{b.i}</span>
                                <h4 className="font-bold text-xl mb-1">{b.t}</h4>
                                <p className="text-sm opacity-60 font-medium">{b.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="py-20 px-8 border-t border-slate-900 bg-[#050816]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
                    <div className="max-w-sm">
                        <div className="font-black text-xl text-white mb-6">CityPath<span className="text-cyan-500">Edu</span></div>
                        <p className="text-sm text-slate-500 leading-relaxed">Proyek visualisasi algoritma edukatif berbasis web. Membantu akademisi dan pengembang memahami logika navigasi melalui representasi spasial 3D.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-16">
                        <div>
                            <h5 className="text-white font-bold mb-4 uppercase text-[10px] tracking-widest">Stack</h5>
                            <ul className="text-sm text-slate-500 space-y-2">
                                <li>Next.js 15</li>
                                <li>Three.js (R3F)</li>
                                <li>Tailwind CSS</li>
                                <li>TypeScript</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-white font-bold mb-4 uppercase text-[10px] tracking-widest">Resources</h5>
                            <ul className="text-sm text-slate-500 space-y-2 cursor-pointer">
                                <li className="hover:text-cyan-400 transition-colors">Documentation</li>
                                <li className="hover:text-cyan-400 transition-colors">Dijkstra Theory</li>
                                <li className="hover:text-cyan-400 transition-colors">A* Heuristics</li>
                                <li className="hover:text-cyan-400 transition-colors">GitHub Repo</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-900 text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em] flex flex-col md:flex-row justify-between items-center gap-4">
                    <span>© {new Date().getFullYear()} Royhan Firdaus / CityPath Edu.</span>
                    <span>Created with Love for Multimedia Education.</span>
                </div>
            </footer>
        </div>
    )
}