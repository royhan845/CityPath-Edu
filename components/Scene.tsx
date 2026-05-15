"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { MapControls, OrbitControls, Grid as DreiGrid, Sky, GizmoHelper, GizmoViewport } from "@react-three/drei"
import PathfindingGrid from "./Grid"
import { BUILDINGS } from "../config/constants"
import TemplateSelector from "./TemplateSelector"

interface SceneProps {
    templateId?: string;
    initialMode?: 'tutorial' | 'report';
}

// INTERFACE BARU UNTUK GROUP STORAGE
interface GlobalLogGroup {
    id: string;
    name: string;
    date: string;
    template: string;
    records: { algo: string, visited: number, path: number, time: number }[];
    mapState?: any;
}

export default function Scene({ templateId: initialTemplate = 'empty', initialMode = 'tutorial' }: SceneProps) {
    const [algorithm, setAlgorithm] = useState("astar")
    const [triggerRun, setTriggerRun] = useState(false)

    const [clearPathTrigger, setClearPathTrigger] = useState(false)
    const [clearBoardTrigger, setClearBoardTrigger] = useState(false)

    const [drawMode, setDrawMode] = useState("start")
    const [rotationStep, setRotationStep] = useState(0)

    const [templateId, setTemplateId] = useState(initialTemplate);
    const [gridKey, setGridKey] = useState(0);

    const [activeMapState, setActiveMapState] = useState<any>(null);
    const [restoredMapState, setRestoredMapState] = useState<any>(null);

    const [isMobile, setIsMobile] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [simSpeed, setSimSpeed] = useState(50); 
    const [isPlaying, setIsPlaying] = useState(false);

    const [showReport, setShowReport] = useState(false);
    const [hasNewReport, setHasNewReport] = useState(false);
    
    // TAB & SAVE STATE
    const [activeTab, setActiveTab] = useState<'current' | 'global'>('current');
    const [isSaving, setIsSaving] = useState(false);
    const [saveName, setSaveName] = useState("");
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    
    const [stats, setStats] = useState<{visited: number, path: number, time: number} | null>(null);
    const [liveText, setLiveText] = useState<string>("Sistem Siap. Silakan bangun rintangan atau pilih template.");

    // DUAL STORAGE STATES
    const [history, setHistory] = useState<{algo: string, visited: number, path: number, time: number}[]>([]);
    const [globalHistory, setGlobalHistory] = useState<GlobalLogGroup[]>([]);
    
    const [isStorageLoaded, setIsStorageLoaded] = useState(false);

    useEffect(() => {
        const sessionHist = sessionStorage.getItem('citypath_session_history');
        if (sessionHist) { try { setHistory(JSON.parse(sessionHist)); } catch (e) { } }

        const localHist = localStorage.getItem('citypath_global_history_v2'); 
        if (localHist) { try { setGlobalHistory(JSON.parse(localHist)); } catch (e) { } }
        
        setIsStorageLoaded(true);
    }, []);

    useEffect(() => {
        if (isStorageLoaded) {
            sessionStorage.setItem('citypath_session_history', JSON.stringify(history));
            localStorage.setItem('citypath_global_history_v2', JSON.stringify(globalHistory));
        }
    }, [history, globalHistory, isStorageLoaded]);

    const algorithmDetails: Record<string, { title: string, desc: string, icon: string, color: string, time: string, space: string, tag: string }> = {
        astar: { title: "A* Search", icon: "⭐", color: "text-emerald-400", time: "O(E)", space: "O(V)", tag: "Optimal & Cepat", desc: "Menggunakan Heuristik untuk memprioritaskan node terdekat ke target." },
        greedy: { title: "Greedy BFS", icon: "🏃‍♂️", color: "text-yellow-400", time: "O(V)", space: "O(V)", tag: "Cepat, Tidak Optimal", desc: "Agresif ke arah target tanpa mempedulikan total jarak tempuh." },
        dijkstra: { title: "Dijkstra", icon: "🌊", color: "text-cyan-400", time: "O(V²)", space: "O(V)", tag: "Pasti Optimal", desc: "Mengekspansi area secara radial layaknya gelombang air." },
        bfs: { title: "Breadth-First", icon: "⭕", color: "text-blue-400", time: "O(V+E)", space: "O(V)", tag: "Eksplorasi Level", desc: "Menelusuri grid lapis demi lapis. Sangat andal untuk labirin murni." },
        dfs: { title: "Depth-First", icon: "⛏️", color: "text-rose-400", time: "O(V+E)", space: "O(V)", tag: "Eksplorasi Dalam", desc: "Menyusuri satu lorong sedalam-dalamnya secara membabi buta." }
    };

    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);
    const tutorialSlides = [
        { title: "Konfigurasi Environment", desc: "Desain topologi rintangan. Semakin kompleks kotamu, semakin menantang untuk algoritmanya!", video: "./video/Konfigurasi Environment.mp4" },
        { title: "Penempatan Entitas", desc: "Pilih instrumen 'Titik Awal' atau 'Titik Tujuan', lalu klik di area tanah kosong.", video: "./video/tutorial-2.mp4" },
        { title: "Analisis Algoritma", desc: "Eksekusi algoritma dan bandingkan efisiensinya dalam memecahkan labirin.", video: "./video/tutorial-3.mp4" }
    ];

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (initialMode === 'report') {
                setShowTutorial(false);
                setShowReport(true);
            } else {
                setShowTutorial(true);
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [initialMode]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r') setRotationStep((prev) => (prev + 1) % 4)
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleVisualize = () => {
        if (isPlaying) return;
        setIsPlaying(true);
        setTriggerRun(true); 
        setTimeout(() => setTriggerRun(false), 100); 
    }

    const handleClearPath = () => { 
        setClearPathTrigger(true); 
        setStats(null); 
        setIsPlaying(false);
        setShowReport(false);
        setHasNewReport(false);
        setLiveText("Rute dibersihkan. Menunggu instruksi...");
        setTimeout(() => setClearPathTrigger(false), 100); 
    }

    const handleClearBoard = () => { 
        setClearBoardTrigger(true); 
        setStats(null); 
        setHistory([]);
        sessionStorage.removeItem('citypath_session_history');
        setIsPlaying(false);
        setShowReport(false);
        setHasNewReport(false);
        setLiveText("Lingkungan dibersihkan. Kanvas kosong.");
        setTimeout(() => setClearBoardTrigger(false), 100); 
    }

    const deleteActiveLog = (idxToRemove: number) => {
        setHistory(prev => prev.filter((_, idx) => idx !== idxToRemove));
    };

    const saveToGlobalLogbook = () => {
        if (!saveName.trim() || history.length === 0) return;
        
        const newGroup: GlobalLogGroup = {
            id: Date.now().toString(),
            name: saveName,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
            template: templateId || 'custom',
            records: [...history],
            mapState: activeMapState
        };

        setGlobalHistory(prev => [newGroup, ...prev]);
        setSaveName("");
        setIsSaving(false);
        setActiveTab('global');
        setExpandedGroups(prev => [...prev, newGroup.id]);
    };

    const deleteSelectedGroups = () => {
        setGlobalHistory(prev => prev.filter(g => !selectedGroups.includes(g.id)));
        setSelectedGroups([]);
    };
    const deleteSingleGroup = (id: string) => {
        setGlobalHistory(prev => prev.filter(g => g.id !== id));
        setSelectedGroups(prev => prev.filter(gId => gId !== id));
    };

    const restoreToActiveSession = (group: GlobalLogGroup) => {
        setTemplateId(group.template);
        setRestoredMapState(group.mapState || null);
        setGridKey(prev => prev + 1);
        setHistory([...group.records]);
        setActiveTab('current');
        setStats(null);
        setLiveText(`Eksperimen "${group.name}" dimuat kembali ke sesi aktif.`);
    };

    return (
        <div className="relative h-[100dvh] w-full bg-[#050816] overflow-hidden font-sans text-slate-300">
            
            {/* 1. PANEL KIRI: EDITOR ZONE */}
            <div className={`absolute z-10 flex flex-col bg-[#0B1120]/80 backdrop-blur-xl border-slate-800/60 shadow-2xl transition-all duration-500 ease-in-out ${isMobile ? 'bottom-20 left-4 right-4 rounded-2xl border max-h-[40vh]' : 'top-6 bottom-24 left-6 w-80 rounded-3xl border'} overflow-hidden`}>
                <div className="p-5 border-b border-slate-800/60 bg-[#0B1120]/50 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-bold tracking-wide flex items-center gap-2"><span className="text-cyan-500">❖</span> Spatial Editor</h2>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">Build & Configure</p>
                    </div>
                    <button onClick={() => { setTutorialStep(0); setShowTutorial(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/50 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 border border-slate-700/50 hover:border-cyan-500/30 rounded-lg transition-all text-[10px] font-bold tracking-wider uppercase active:scale-95">
                        <span>📖</span> Panduan
                    </button>
                </div>

                <div className="p-5 overflow-y-auto slim-scrollbar flex flex-col gap-6">
                    <div>
                        <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-3 block">1. Environment</label>
                        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pt-2 pb-5 px-2 cursor-grab active:cursor-grabbing slim-scrollbar">
                            {Object.entries(BUILDINGS).filter(([_, data]) => data.id >= 7).map(([key, data]) => (
                                <button key={key} onClick={() => setDrawMode(key)} className={`relative w-16 h-16 rounded-xl transition-all shrink-0 flex items-center justify-center ${drawMode === key ? 'border-2 border-cyan-400 scale-110 shadow-[0_0_20px_rgba(34,211,238,0.4)] z-10' : 'border border-slate-700/50 opacity-60 hover:opacity-100 hover:scale-105'}`}>
                                    <div className="w-full h-full rounded-[10px] overflow-hidden relative pointer-events-none">
                                        <img src={data.image} alt={data.name} className="w-full h-full object-cover bg-slate-900" />
                                        <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] py-1 text-center font-mono text-cyan-300 font-bold">{data.sizeX}x{data.sizeZ}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <TemplateSelector onSelectTemplate={(id) => { 
                            setTemplateId(id); 
                            setGridKey(prev => prev + 1);
                            setHistory([]); 
                            sessionStorage.removeItem('citypath_session_history'); 
                        }} />
                    </div>

                    <div>
                        <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-3 block">2. Entity & Tools</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setDrawMode("select")} className={`py-2.5 text-xs font-medium rounded-lg transition-all border ${drawMode === 'select' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800 text-slate-400'}`}>Pilih / Rotasi</button>
                            <button onClick={() => setDrawMode("delete")} className={`py-2.5 text-xs font-medium rounded-lg transition-all border ${drawMode === 'delete' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800 text-slate-400'}`}>Hapus Objek</button>
                            <button onClick={() => setDrawMode("start")} className={`py-2.5 text-xs font-medium rounded-lg transition-all border ${drawMode === 'start' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800 text-slate-400'}`}>Set Start</button>
                            <button onClick={() => setDrawMode("end")} className={`py-2.5 text-xs font-medium rounded-lg transition-all border ${drawMode === 'end' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800 text-slate-400'}`}>Set Target</button>
                        </div>
                        <button onClick={() => setRotationStep((prev) => (prev + 1) % 4)} className="w-full mt-2 py-2.5 text-xs font-mono rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700/50">[R] Rotate Object</button>
                    </div>

                    <div className="border-t border-slate-800/60 pt-4 mt-auto">
                        <button onClick={handleClearBoard} className="w-full py-2.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 transition-all border border-slate-800 hover:border-rose-500/30">Clear Environment</button>
                    </div>
                </div>
            </div>

            {/* 2. PANEL KANAN: EDUCATIONAL ZONE */}
            <div className={`absolute z-10 flex flex-col bg-[#0B1120]/80 backdrop-blur-xl border-slate-800/60 shadow-2xl transition-all duration-500 ease-in-out ${isMobile ? 'hidden' : 'top-6 bottom-24 right-6 w-80 rounded-3xl border'} overflow-hidden`}>
                <div className="p-5 border-b border-slate-800/60 bg-[#0B1120]/50">
                    <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase block mb-2">Pilih Algoritma</label>
                    <select disabled={isPlaying} className="w-full bg-[#050816] text-sm font-medium text-white border border-slate-700/50 rounded-xl px-3 py-3 outline-none focus:border-cyan-500 transition-all cursor-pointer disabled:opacity-50" value={algorithm} onChange={(e) => { setAlgorithm(e.target.value); handleClearPath(); }}>
                        <option value="astar">A* (A-Star) Search</option>
                        <option value="greedy">Greedy Best-First</option>
                        <option value="dijkstra">Dijkstra's Algorithm</option>
                        <option value="bfs">Breadth-First Search</option>
                        <option value="dfs">Depth-First Search</option>
                    </select>
                </div>

                <div className="p-5 flex-1 overflow-y-auto slim-scrollbar flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className={`text-lg font-bold ${algorithmDetails[algorithm].color}`}>{algorithmDetails[algorithm].title}</h3>
                        <span className="text-[9px] px-2 py-1 bg-slate-800 rounded-md font-mono text-slate-400 border border-slate-700">{algorithmDetails[algorithm].tag}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-5">{algorithmDetails[algorithm].desc}</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Time Complexity</span>
                            <span className="text-sm font-mono text-white">{algorithmDetails[algorithm].time}</span>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Space Complexity</span>
                            <span className="text-sm font-mono text-white">{algorithmDetails[algorithm].space}</span>
                        </div>
                    </div>

                    <div className="border-t border-slate-800/60 pt-5 mt-auto">
                        <label className="text-[10px] text-slate-500 font-bold tracking-widest uppercase block mb-3">Real-time Statistics</label>
                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between items-center bg-[#050816] px-4 py-2.5 rounded-lg border border-slate-800/50">
                                <span className="text-xs text-slate-400">Nodes Evaluated</span><span className="text-sm font-mono text-cyan-400 font-bold">{stats ? stats.visited : '-'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#050816] px-4 py-2.5 rounded-lg border border-slate-800/50">
                                <span className="text-xs text-slate-400">Path Length</span><span className="text-sm font-mono text-emerald-400 font-bold">{stats ? stats.path : '-'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-[#050816] px-4 py-2.5 rounded-lg border border-slate-800/50">
                                <span className="text-xs text-slate-400">Exec Time (ms)</span><span className="text-sm font-mono text-amber-400 font-bold">{stats ? (stats.time < 0.01 ? '< 0.01' : stats.time.toFixed(2)) : '-'}</span>
                            </div>
                        </div>

                        <button onClick={() => { setShowReport(true); setHasNewReport(false); }} className={`w-full py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${history.length > 0 || globalHistory.length > 0 ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 shadow-lg active:scale-95' : 'bg-slate-800/30 border-slate-800 text-slate-600 cursor-not-allowed'}`}>
                            {hasNewReport && (<span className="relative flex h-2.5 w-2.5 mr-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span></span>)}
                            Performance Analytics
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. PANEL BAWAH: PLAYBACK & CONTROLS */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-[90%] md:w-[600px]">
                <div className="mb-3 text-center">
                    <span className="inline-flex items-center gap-2 bg-[#0B1120]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-800 shadow-lg">
                        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-cyan-500 animate-pulse' : 'bg-slate-600'}`}></span>
                        <span className="text-[10px] font-mono text-slate-300">{liveText}</span>
                    </span>
                </div>

                <div className="bg-[#0B1120]/90 backdrop-blur-xl border border-slate-700/50 p-2 md:p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto justify-center">
                        <button onClick={handleClearPath} disabled={isPlaying} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors disabled:opacity-50" title="Reset Jalur">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </button>
                        <button onClick={handleVisualize} disabled={isPlaying} className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${isPlaying ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-[#050816] shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}>
                            {isPlaying ? (<><span>⏳</span> Running...</>) : (<><span>▶</span> Execute</>)}
                        </button>
                    </div>

                    <div className="flex-1 w-full px-4 border-t md:border-t-0 md:border-l border-slate-700/50 pt-3 md:pt-0 flex flex-col justify-center">
                        <div className="flex justify-between items-end mb-1.5">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sim Speed</span>
                            <span className="text-[10px] font-mono text-cyan-400">{simSpeed} ms/step</span>
                        </div>
                        <input type="range" min="10" max="200" step="10" value={simSpeed} onChange={(e) => setSimSpeed(Number(e.target.value))} disabled={isPlaying} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-50" />
                    </div>
                </div>
            </div>

            {/* MODAL: LAPORAN ANALISIS */}
            <div className={`absolute inset-0 z-[60] flex items-center justify-center p-6 bg-[#050816]/80 backdrop-blur-md transition-all duration-500 ${showReport ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`bg-[#0B1120] border border-slate-700/50 p-6 md:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-[650px] w-full transform transition-all duration-500 delay-100 flex flex-col ${showReport ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'} max-h-[90vh] overflow-hidden`}>
                    
                    <div className="flex justify-between items-start mb-4 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-wide">Evaluasi Algoritma</h2>
                            <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-widest font-mono">Performance Analytics Dashboard</p>
                        </div>
                    </div>

                    <div className="flex gap-6 border-b border-slate-800 mb-6 shrink-0">
                        <button onClick={() => setActiveTab('current')} className={`pb-3 text-xs font-bold transition-all border-b-2 ${activeTab === 'current' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Analisis Sesi Aktif</button>
                        <button onClick={() => setActiveTab('global')} className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'global' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                            📚 Logbook Global <span className="bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded-full">{globalHistory.length}</span>
                        </button>
                    </div>

                    {/* TAB 1: CURRENT SESSION */}
                    {activeTab === 'current' && (
                        <div className="flex-1 overflow-y-auto slim-scrollbar pr-2 flex flex-col gap-4">
                            
                            {history.length > 0 && (
                                <div className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden shrink-0 shadow-inner">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">💡 Insight Analisis & Edukasi</h4>
                                    <div className="text-xs text-slate-300 leading-relaxed font-medium">
                                        {history.length <= 1 ? (
                                            <div className="p-2 bg-[#050816] rounded-xl border border-slate-800/50 text-slate-400 italic">
                                                "Satu algoritma telah direkam. Jalankan algoritma lain (seperti Dijkstra atau Greedy) pada rintangan yang sama untuk mengaktifkan analisis perbandingan edukatif secara mendalam."
                                            </div>
                                        ) : (
                                            (() => {
                                                const bestVisitedAlgo = [...history].sort((a, b) => a.visited - b.visited)[0];
                                                const fastestAlgo = [...history].sort((a, b) => a.time - b.time)[0];
                                                const shortestPathAlgo = [...history].sort((a, b) => a.path - b.path)[0];
                                                const allSamePath = history.every(r => r.path === history[0].path);
                                                const current = history[history.length - 1];

                                                return (
                                                    <div className="space-y-4">
                                                        <p>
                                                            <span className="text-emerald-400 font-bold block mb-1">1. Efisiensi Eksplorasi (Memori)</span>
                                                            Algoritma <b>{algorithmDetails[bestVisitedAlgo.algo]?.title}</b> mengeksplorasi <b>{bestVisitedAlgo.visited} blok</b>. Semakin sedikit blok yang diperiksa, semakin kecil beban RAM yang dibutuhkan. Ini sangat krusial untuk perangkat dengan spesifikasi rendah atau sistem navigasi robotik yang memiliki memori terbatas.
                                                        </p>
                                                        <p>
                                                            <span className="text-amber-400 font-bold block mb-1">2. Kecepatan Komputasi (Responsivitas)</span>
                                                            <b>{algorithmDetails[fastestAlgo.algo]?.title}</b> memimpin dengan waktu <b>{fastestAlgo.time < 0.01 ? "< 0.01" : fastestAlgo.time.toFixed(2)} ms</b>. Kecepatan ini menentukan seberapa "pintar" AI bereaksi. Di industri game, kecepatan ini memastikan ribuan karakter bisa mencari jalan tanpa membuat game terasa patah-patah (*lag*).
                                                        </p>
                                                        {!allSamePath ? (
                                                            <p className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                                                                <span className="text-rose-400 font-bold block mb-1">3. Kualitas Rute (Akurasi Path)</span>
                                                                ⚠️ <b>Analisis Perbedaan:</b> Terdeteksi variasi panjang rute. <b>{algorithmDetails[shortestPathAlgo.algo]?.title}</b> menemukan jalur paling optimal ({shortestPathAlgo.path} langkah). Algoritma lain mungkin lebih cepat, namun menghasilkan rute yang lebih memutar atau boros langkah.
                                                            </p>
                                                        ) : (
                                                            <p className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] text-slate-500 italic">
                                                                Catatan: Sejauh ini, semua algoritma yang diuji menemukan panjang rute yang konsisten optimal ({history[0].path} langkah).
                                                            </p>
                                                        )}
                                                        
                                                        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-400/80 bg-cyan-500/5 p-3 rounded-lg">
                                                            🔍 <b>Fokus Sesi Terakhir:</b> {algorithmDetails[current.algo]?.title} {current.algo === bestVisitedAlgo.algo ? "berhasil mempertahankan rekor efisiensi memori" : `memeriksa ${current.visited - bestVisitedAlgo.visited} blok lebih banyak dibanding rekor terbaik saat ini`}.
                                                        </div>
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </div>
                                </div>
                            )}

                            {history.length > 0 && (
                                <div className="bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl flex flex-col sm:flex-row gap-3 items-center shrink-0">
                                    {isSaving ? (
                                        <>
                                            <input autoFocus type="text" placeholder="Cth: Uji Coba Map Labirin V1..." value={saveName} onChange={(e) => setSaveName(e.target.value)} className="flex-1 bg-[#050816] border border-cyan-500/50 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-cyan-400 w-full" />
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <button onClick={() => setIsSaving(false)} className="px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-300 bg-slate-800 rounded-lg transition-all w-full sm:w-auto">Batal</button>
                                                <button onClick={saveToGlobalLogbook} className="px-4 py-2 text-[10px] font-bold text-[#050816] bg-cyan-500 hover:bg-cyan-400 rounded-lg transition-all shadow-[0_0_10px_rgba(34,211,238,0.3)] w-full sm:w-auto">Simpan Data</button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-1">
                                                <p className="text-xs text-slate-300 font-bold">Simpan Sesi Ini?</p>
                                                <p className="text-[10px] text-slate-500">Rekam tabel perbandingan di bawah ke Logbook agar tidak hilang.</p>
                                            </div>
                                            <button onClick={() => setIsSaving(true)} className="px-4 py-2 text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 rounded-lg transition-all w-full sm:w-auto">💾 Save to Logbook</button>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-[#050816]/50 shrink-0">
                                <div className="bg-[#0B1120] py-3 px-4 border-b border-slate-800/80 grid grid-cols-12 gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">
                                    <div className="col-span-4 text-left">Algoritma</div>
                                    <div className="col-span-2">Blok</div>
                                    <div className="col-span-2">Rute</div>
                                    <div className="col-span-3 text-right">Waktu</div>
                                    <div className="col-span-1"></div>
                                </div>
                                <div className="p-2 space-y-1">
                                    {history.length > 0 ? history.map((item, idx) => (
                                        <div key={idx} className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl font-medium text-xs transition-colors ${idx === history.length - 1 ? 'bg-slate-800/50 border border-slate-700/50' : 'text-slate-400 hover:bg-slate-800/30'}`}>
                                            <div className="col-span-4 text-left truncate font-bold px-2">{algorithmDetails[item.algo]?.title}</div>
                                            <div className="col-span-2 text-center font-mono">{item.visited}</div>
                                            <div className="col-span-2 text-center font-mono">{item.path}</div>
                                            <div className="col-span-3 text-right font-mono text-amber-400">{item.time < 0.01 ? "< 0.01" : item.time.toFixed(2)} ms</div>
                                            <div className="col-span-1 flex justify-center gap-1">
                                                <button 
                                                    onClick={() => {
                                                        setAlgorithm(item.algo); 
                                                        setShowReport(false); 
                                                        setTimeout(() => handleVisualize(), 300); 
                                                    }}
                                                    className="w-6 h-6 flex items-center justify-center rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 transition-colors" 
                                                    title="Jalankan Ulang"
                                                >
                                                    ▶
                                                </button>
                                                <button onClick={() => deleteActiveLog(idx)} className="w-6 h-6 flex items-center justify-center rounded bg-transparent hover:bg-rose-500/20 text-slate-600 hover:text-rose-400 transition-colors" title="Hapus baris ini">✖</button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-8 text-center flex flex-col items-center opacity-60">
                                            <div className="w-8 h-8 border-2 border-dashed border-slate-600 rounded-full flex items-center justify-center mb-3"><span className="text-slate-500 text-xs">?</span></div>
                                            <p className="text-xs text-slate-400">Belum ada komparasi di sesi ini.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: GLOBAL LOGBOOK (GROUPED ACCORDION) */}
                    {activeTab === 'global' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center mb-4 shrink-0 bg-slate-900/50 p-3 rounded-xl border border-slate-800/80">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" onChange={() => selectedGroups.length === globalHistory.length ? setSelectedGroups([]) : setSelectedGroups(globalHistory.map(g => g.id))} checked={selectedGroups.length === globalHistory.length && globalHistory.length > 0} className="w-4 h-4 accent-cyan-500 rounded bg-slate-800 border-slate-700"/>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Pilih Semua ({selectedGroups.length}/{globalHistory.length})</span>
                                </label>
                                {selectedGroups.length > 0 && (
                                    <button onClick={deleteSelectedGroups} className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest bg-rose-500/10 px-4 py-1.5 rounded-lg border border-rose-500/30 transition-all active:scale-95">🗑️ Hapus Grup</button>
                                )}
                            </div>
                            
                            <div className="flex-1 overflow-y-auto slim-scrollbar space-y-3 pr-2 pb-4">
                                {globalHistory.length > 0 ? globalHistory.map(group => {
                                    const isExpanded = expandedGroups.includes(group.id);
                                    
                                    return (
                                        <div key={group.id} className={`flex flex-col rounded-2xl border transition-all duration-300 overflow-hidden ${selectedGroups.includes(group.id) ? 'bg-cyan-500/5 border-cyan-500/40 shadow-sm' : 'bg-[#050816]/50 border-slate-800/80 hover:border-slate-700/80'}`}>
                                            
                                            <div 
                                                onClick={() => setExpandedGroups(prev => prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id])}
                                                className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div onClick={(e) => e.stopPropagation()}>
                                                        <input type="checkbox" checked={selectedGroups.includes(group.id)} onChange={() => setSelectedGroups(prev => prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id])} className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"/>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white mb-0.5">{group.name}</h4>
                                                        <p className="text-[10px] text-slate-500 font-mono">{group.date} • Map: <span className="text-emerald-400/80 uppercase">{group.template}</span> • {group.records.length} Algoritma</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                                                        {isExpanded ? 'Tutup ▴' : 'Detail ▾'}
                                                    </span>
                                                    <button onClick={(e) => { e.stopPropagation(); deleteSingleGroup(group.id); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/30 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30" title="Hapus Grup">✖</button>
                                                </div>
                                            </div>

                                            <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <div className="p-4 pt-0 border-t border-slate-800/50 mt-1 space-y-4">
                                                    
                                                    <div className="mt-4 flex justify-between items-center bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl">
                                                        <div className="text-[10px] text-emerald-400/80 font-medium">
                                                            Ingin melihat kesimpulan edukatifnya?
                                                        </div>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); restoreToActiveSession(group); }}
                                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
                                                        >
                                                            <span>📂</span> Muat ke Sesi Aktif
                                                        </button>
                                                    </div>

                                                    <div className="bg-[#0B1120] rounded-xl border border-slate-800/80 overflow-hidden">
                                                        <div className="bg-slate-900/80 py-2 px-3 border-b border-slate-800/80 grid grid-cols-5 gap-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center">
                                                            <div className="col-span-2 text-left">Algoritma</div>
                                                            <div className="col-span-1">Blok</div>
                                                            <div className="col-span-1">Rute</div>
                                                            <div className="col-span-1 text-right">Waktu</div>
                                                        </div>
                                                        <div className="p-1.5 space-y-1">
                                                            {group.records.map((rec, rIdx) => (
                                                                <div key={rIdx} className="grid grid-cols-5 gap-2 text-[10px] items-center hover:bg-slate-800/40 p-1.5 rounded-lg transition-colors">
                                                                    <span className={`col-span-2 font-bold px-1 truncate ${algorithmDetails[rec.algo]?.color || 'text-slate-400'}`}>{algorithmDetails[rec.algo]?.title || rec.algo}</span>
                                                                    <span className="font-mono text-center text-slate-300 bg-slate-800/50 rounded py-0.5">{rec.visited}</span>
                                                                    <span className="font-mono text-center text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 rounded py-0.5">{rec.path}</span>
                                                                    <span className="font-mono text-right text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded py-0.5 px-1.5">{rec.time < 0.01 ? '<0.01' : rec.time.toFixed(2)}ms</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                        </div>
                                    );
                                }) : (
                                    <div className="py-16 text-center opacity-50 flex flex-col items-center">
                                        <span className="text-4xl mb-4 block drop-shadow-lg">📭</span>
                                        <h4 className="text-sm text-slate-300 font-bold mb-1">Logbook Kosong</h4>
                                        <p className="text-xs text-slate-500">Semua eksperimen algoritmamu akan dicatat abadi di sini.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-800/60 shrink-0">
                        <button onClick={() => setShowReport(false)} className="w-full bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-bold py-3.5 rounded-xl transition-all border border-slate-700/50 active:scale-95 text-xs">Tutup</button>
                        <button onClick={() => { setShowReport(false); setStats(null); handleClearPath(); }} className="w-full bg-cyan-500 hover:bg-cyan-600 text-[#050816] font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95 text-xs">Uji Algoritma Lain</button>
                    </div>
                </div>
            </div>

            <div className={`absolute inset-0 z-[70] flex items-center justify-center p-6 bg-[#050816]/80 backdrop-blur-md transition-all duration-500 ${showTutorial ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`bg-[#0B1120] border border-slate-700/50 p-6 md:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-lg w-full transform transition-all duration-500 delay-100 ${showTutorial ? 'translate-y-0 scale-100' : 'translate-y-10 scale-95'}`}>
                    <div className="flex justify-center gap-2 mb-6">{tutorialSlides.map((_, idx) => (<div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${tutorialStep === idx ? 'w-8 bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'w-2 bg-slate-800'}`}></div>))}</div>
                    <div className="w-full aspect-video bg-[#050816] rounded-2xl mb-6 overflow-hidden border border-slate-800/80 flex items-center justify-center relative shadow-inner"><video key={tutorialSlides[tutorialStep]?.video} src={tutorialSlides[tutorialStep]?.video} autoPlay loop muted playsInline className="w-full h-full object-cover relative z-10 opacity-80 mix-blend-screen" /><div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent z-20"></div></div>
                    <div className="min-h-[100px]"><h2 className="text-xl font-bold text-white mb-2 tracking-wide flex items-center gap-2"><span className="text-cyan-500 text-sm">⟡</span> {tutorialSlides[tutorialStep]?.title}</h2><p className="text-slate-400 text-sm leading-relaxed">{tutorialSlides[tutorialStep]?.desc}</p></div>
                    <div className="flex gap-3 mt-8">
                        <button onClick={() => setTutorialStep(prev => Math.max(0, prev - 1))} className={`flex-1 py-3.5 rounded-xl font-bold transition-all border text-xs ${tutorialStep === 0 ? 'opacity-0 pointer-events-none' : 'bg-slate-800/30 text-slate-300 border-slate-700/50 hover:bg-slate-800/80'}`}>Sebelumnya</button>
                        {tutorialStep < tutorialSlides.length - 1 ? (<button onClick={() => setTutorialStep(prev => prev + 1)} className="flex-1 py-3.5 rounded-xl font-bold transition-all bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 active:scale-95 text-xs flex justify-center items-center gap-2">Selanjutnya <span>→</span></button>) : (<button onClick={() => setShowTutorial(false)} className="flex-1 py-3.5 rounded-xl font-bold transition-all bg-cyan-500 hover:bg-cyan-600 text-[#050816] border border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95 text-xs">Mulai Eksplorasi</button>)}
                    </div>
                    <button onClick={() => setShowTutorial(false)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/30 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors border border-transparent hover:border-rose-500/50 text-xs" title="Tutup Tutorial">✖</button>
                </div>
            </div>

            <Canvas dpr={[1, 1.5]}  camera={{ position: isMobile ? [0, 15, 30] : [0, 18, 25], fov: isMobile ? 55 : 30 }}>
                <ambientLight intensity={1} />
                <directionalLight position={[10, 20, 10]} intensity={1.5} color="#e2e8f0" />
                <pointLight position={[-10, 10, -10]} intensity={0.5} color="#38bdf8" />
                
                {isMobile ? (<OrbitControls makeDefault minDistance={10} maxDistance={70} maxPolarAngle={Math.PI / 2.1} />) : (<MapControls makeDefault minDistance={10} maxDistance={70} panSpeed={1.5} maxPolarAngle={Math.PI / 2.2} />)}

                <DreiGrid position={[0, -0.11, 0]} infiniteGrid sectionSize={1} sectionColor="#1e293b" cellColor="#0f172a" fadeDistance={40} />
                
                <Suspense fallback={null}>
                    <PathfindingGrid 
                        key={`grid-${templateId}-${gridKey}`}
                        triggerRun={triggerRun} 
                        algorithm={algorithm} 
                        clearPathTrigger={clearPathTrigger} 
                        clearBoardTrigger={clearBoardTrigger} 
                        drawMode={drawMode} 
                        setDrawMode={setDrawMode} 
                        rotationStep={rotationStep} 
                        isMobile={isMobile} 
                        templateId={templateId} 
                        simSpeed={simSpeed} 
                        onStepUpdate={(text) => setLiveText(text)}
                        restoredMapData={restoredMapState}
                        onFinishAnimation={(visited, path, time, currentGridData) => {
                            setStats({ visited, path, time }); 
                            setIsPlaying(false); 
                            setLiveText("Simulasi selesai. Data ditambahkan ke Sesi Aktif."); 
                            setHasNewReport(true);
                            setActiveMapState(currentGridData);
                            setHistory(prev => {
                                const lastEntry = prev[prev.length - 1];
                                if (lastEntry && lastEntry.algo === algorithm && lastEntry.visited === visited) return prev;
                                return [...prev, { algo: algorithm, visited, path, time }];
                            });
                        }}
                    />
                </Suspense>
            </Canvas>
        </div>
    )
}