"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, BarChart2, Activity, Trash2, Cpu, Save, Play, FolderOpen, Archive, Info, AlertTriangle } from "lucide-react"
import { useSimulationStore, GlobalLogGroup } from "../../stores/useSimulationStore"

export default function PerformanceAnalyticsModal({ onClose }: { onClose: () => void }) {
    const { 
        history, globalHistory, addGlobalHistory, setGlobalHistory, setHistory, 
        clearHistory, clearGlobalHistory, templateId, setTemplateId,
        setAlgorithm, executeRun, executeClearPath, setRestoredMapData
    } = useSimulationStore();
    
    const [activeTab, setActiveTab] = useState<'current' | 'global'>('current');
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveName, setSaveName] = useState("");

    const isSessionSaved = globalHistory.some(
        group => JSON.stringify(group.records) === JSON.stringify(history)
    );

    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        actionType: 'clearCurrent' | 'clearGlobal' | 'singleCurrent' | 'singleGlobal' | 'selectedGlobal';
        targetId?: string | number;
    }>({ isOpen: false, title: "", message: "", actionType: 'clearCurrent' });

    const algorithmDetails: Record<string, { title: string, color: string }> = {
        astar: { title: "A* Search", color: "text-emerald-400" },
        greedy: { title: "Greedy BFS", color: "text-yellow-400" },
        dijkstra: { title: "Dijkstra", color: "text-cyan-400" },
        bfs: { title: "Breadth-First", color: "text-blue-400" },
        dfs: { title: "Depth-First", color: "text-rose-400" }
    };

    const handleOpenSaveDialog = () => {
        if (history.length === 0 || isSessionSaved) return;
        setSaveName(`Eksperimen ${new Date().toLocaleTimeString('id-ID')}`);
        setShowSaveDialog(true);
    };

    const confirmSave = () => {
        if (!saveName.trim()) return;
        
        const newGroup: GlobalLogGroup = { 
            id: Date.now().toString(), 
            name: saveName.trim(), 
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), 
            template: templateId || 'custom', 
            records: [...history] 
        };
        
        addGlobalHistory(newGroup);
        setShowSaveDialog(false);
        setActiveTab('global');
    };

    const executeDeleteAction = () => {
        switch(deleteDialog.actionType) {
            case 'clearCurrent':
                clearHistory();
                break;
                
            case 'clearGlobal':
                if (isSessionSaved) {
                    clearHistory();
                }
                clearGlobalHistory();
                setSelectedGroups([]);
                break;
                
            case 'singleCurrent':
                if (typeof deleteDialog.targetId === 'number') {
                    const newHistory = [...history];
                    newHistory.splice(deleteDialog.targetId, 1);
                    setHistory(newHistory);
                }
                break;
                
            case 'singleGlobal':
                if (typeof deleteDialog.targetId === 'string') {
                    const groupToDelete = globalHistory.find(g => g.id === deleteDialog.targetId);
                    if (groupToDelete && JSON.stringify(groupToDelete.records) === JSON.stringify(history)) {
                        clearHistory();
                    }
                    
                    setGlobalHistory(globalHistory.filter(g => g.id !== deleteDialog.targetId));
                    setSelectedGroups(prev => prev.filter(selectedId => selectedId !== deleteDialog.targetId));
                }
                break;
                
            case 'selectedGlobal':
                const groupsToDelete = globalHistory.filter(g => selectedGroups.includes(g.id));
                const isLoadedGroupSelected = groupsToDelete.some(g => JSON.stringify(g.records) === JSON.stringify(history));
                
                if (isLoadedGroupSelected) {
                    clearHistory();
                }
                
                setGlobalHistory(globalHistory.filter(g => !selectedGroups.includes(g.id)));
                setSelectedGroups([]);
                break;
        }
        setDeleteDialog({ ...deleteDialog, isOpen: false });
    };

    const triggerDeleteSingleGroup = (id: string) => {
        setDeleteDialog({ isOpen: true, title: "Hapus Arsip", message: "Hapus data eksperimen ini dari arsip secara permanen?", actionType: 'singleGlobal', targetId: id });
    };

    const triggerDeleteSelectedGroups = () => {
        setDeleteDialog({ isOpen: true, title: "Hapus Masal", message: `Hapus ${selectedGroups.length} eksperimen terpilih? Data tidak bisa dikembalikan.`, actionType: 'selectedGlobal' });
    };

    const triggerDeleteSingleHistoryItem = (index: number) => {
        setDeleteDialog({ isOpen: true, title: "Hapus Rekam Jejak", message: "Hapus catatan percobaan ini dari sesi aktif?", actionType: 'singleCurrent', targetId: index });
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-[#050816]/70 backdrop-blur-sm" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.15)] rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
            >
                <AnimatePresence>
                    {/* MODAL SIMPAN */}
                    {showSaveDialog && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#050816]/70 backdrop-blur-md"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="w-full max-w-sm bg-[#0f172a]/90 backdrop-blur-2xl border border-emerald-500/30 p-6 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                                        <Save size={18} />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-widest">Simpan Arsip</h3>
                                </div>
                                <p className="text-[10px] text-slate-400 mb-5 font-mono leading-relaxed">
                                    Masukkan label identifikasi untuk menyimpan data sesi komputasi ini ke dalam Logbook Global.
                                </p>
                                <input
                                    type="text"
                                    value={saveName}
                                    onChange={(e) => setSaveName(e.target.value)}
                                    className="w-full bg-[#050816]/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500/50 shadow-inner mb-6 placeholder-slate-600 transition-colors"
                                    placeholder="Nama arsip..."
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && confirmSave()}
                                />
                                <div className="flex gap-3 justify-end mt-auto">
                                    <button 
                                        onClick={() => setShowSaveDialog(false)} 
                                        className="px-5 py-2.5 rounded-xl text-[10px] font-bold text-slate-400 border border-white/10 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        onClick={confirmSave} 
                                        className="px-5 py-2.5 rounded-xl text-[10px] font-bold text-[#050816] bg-emerald-400 hover:bg-emerald-300 transition-all uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                                    >
                                        Konfirmasi
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* MODAL HAPUS CUSTOM */}
                    {deleteDialog.isOpen && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-[#050816]/70 backdrop-blur-md"
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="w-full max-w-sm bg-[#0f172a]/90 backdrop-blur-2xl border border-rose-500/30 p-6 rounded-3xl shadow-[0_0_40px_rgba(244,63,94,0.15)] flex flex-col"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
                                        <AlertTriangle size={18} />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-widest">{deleteDialog.title}</h3>
                                </div>
                                <p className="text-xs text-slate-400 mb-6 font-mono leading-relaxed mt-2 border-l-2 border-rose-500/30 pl-3">
                                    {deleteDialog.message}
                                </p>
                                
                                <div className="flex gap-3 justify-end mt-4">
                                    <button 
                                        onClick={() => setDeleteDialog({ ...deleteDialog, isOpen: false })} 
                                        className="px-5 py-2.5 rounded-xl text-[10px] font-bold text-slate-400 border border-white/10 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        onClick={executeDeleteAction} 
                                        className="px-5 py-2.5 rounded-xl text-[10px] font-bold text-white bg-rose-500/80 hover:bg-rose-500 transition-all uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.4)] border border-rose-500"
                                    >
                                        <Trash2 size={12} /> Eksekusi
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Tabs */}
                <div className="p-5 border-b border-white/10 bg-white/5">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400"><BarChart2 size={20} /></div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-100 font-mono tracking-wide">PERFORMANCE MATRIX</h2>
                                <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">Dual-Storage Analytics</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/5 rounded-xl border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"><X size={20} /></button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab('current')} className={`px-4 py-2 text-[10px] font-bold uppercase rounded-xl transition-all border ${activeTab === 'current' ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400 shadow-inner' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}>Sesi Aktif ({history.length})</button>
                        <button onClick={() => setActiveTab('global')} className={`px-4 py-2 text-[10px] font-bold uppercase rounded-xl transition-all border ${activeTab === 'global' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-inner' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}>Arsip Global ({globalHistory.length})</button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[#050816]/30">
                    
                    {/* TAB 1: CURRENT SESSION */}
                    {activeTab === 'current' && (
                        <div className="space-y-6">
                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-4">
                                    <Activity size={48} className="opacity-20" />
                                    <p className="font-mono text-xs uppercase tracking-widest">Belum ada data aktif. Muat dari arsip atau jalankan simulasi.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Kesimpulan Analisis */}
                                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl relative overflow-hidden shadow-inner backdrop-blur-md">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <Info size={16} className="text-cyan-400" />
                                            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Kesimpulan Analisis</h4>
                                        </div>
                                        
                                        <div className="text-xs text-slate-300 leading-relaxed">
                                            {history.length === 1 ? (
                                                <div className="p-3 bg-[#050816]/50 rounded-xl border border-white/5 text-slate-400 italic">
                                                    Sistem membutuhkan minimal dua algoritma untuk melakukan perbandingan. Silakan jalankan algoritma lain pada rintangan yang sama.
                                                </div>
                                            ) : (
                                                (() => {
                                                    const bestVisited = [...history].sort((a, b) => a.visited - b.visited)[0];
                                                    const fastest = [...history].sort((a, b) => a.time - b.time)[0];
                                                    const shortestPath = [...history].sort((a, b) => a.path - b.path)[0];
                                                    const allSamePath = history.every(r => r.path === history[0].path);

                                                    return (
                                                        <div className="space-y-4">
                                                            <p>
                                                                <span className="text-emerald-400 font-bold block mb-1">1. Paling Hemat Memori (Pengecekan Minimum)</span>
                                                                Algoritma <b className={algorithmDetails[bestVisited.algo]?.color}>{algorithmDetails[bestVisited.algo]?.title || bestVisited.algo}</b> bekerja paling efisien dengan hanya memeriksa <b>{bestVisited.visited} blok jalan</b>. Semakin sedikit blok yang diperiksa, semakin ringan beban komputasinya pada perangkat.
                                                            </p>
                                                            <p>
                                                                <span className="text-amber-400 font-bold block mb-1">2. Waktu Eksekusi Tercepat</span>
                                                                Kecepatan pemrosesan dipimpin oleh <b className={algorithmDetails[fastest.algo]?.color}>{algorithmDetails[fastest.algo]?.title || fastest.algo}</b> yang menyelesaikan pencarian dalam waktu <b>{fastest.time < 0.01 ? "< 0.01" : fastest.time.toFixed(2)} ms</b>. Sangat ideal untuk sistem yang membutuhkan respons instan.
                                                            </p>
                                                            {!allSamePath ? (
                                                                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl backdrop-blur-sm">
                                                                    <span className="text-rose-400 font-bold block mb-1">3. Jarak Rute Terpendek</span>
                                                                    Terdapat perbedaan jalur antar algoritma. <b className={algorithmDetails[shortestPath.algo]?.color}>{algorithmDetails[shortestPath.algo]?.title || shortestPath.algo}</b> berhasil menemukan rute paling akurat dan terpendek dengan total <b>{shortestPath.path} langkah</b>.
                                                                </div>
                                                            ) : (
                                                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-100/70 backdrop-blur-sm">
                                                                    <span className="text-emerald-400 font-bold block mb-1">3. Jarak Rute Terpendek</span>
                                                                    Seluruh algoritma berhasil menemukan rute terpendek yang sama persis, yaitu <b>{history[0].path} langkah</b>.
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()
                                            )}
                                        </div>
                                    </div>

                                    {/* Tabel Riwayat Sesi Aktif */}
                                    <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#050816]/50 shadow-inner">
                                        <div className="overflow-x-auto custom-scrollbar">
                                            <div className="min-w-[500px]">
                                                
                                                {/* Header Tabel */}
                                                <div className="bg-white/5 py-3 px-4 border-b border-white/10 grid grid-cols-12 gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <div className="col-span-4">Algoritma</div>
                                                    <div className="col-span-2 text-right">Cek Blok</div>
                                                    <div className="col-span-2 text-right">Jarak Rute</div>
                                                    <div className="col-span-2 text-right">Waktu (ms)</div>
                                                    <div className="col-span-2 text-center">Aksi</div>
                                                </div>
                                                
                                                {/* Isi Tabel */}
                                                <div className="p-2 space-y-1">
                                                    {history.map((record, idx) => (
                                                        <div key={idx} className={`grid grid-cols-12 gap-2 items-center px-2 py-2 rounded-xl text-xs font-mono transition-all ${idx === history.length - 1 ? 'bg-cyan-500/10 border border-cyan-500/30' : 'hover:bg-white/5 border border-transparent'}`}>
                                                            <div className="col-span-4 flex items-center gap-2">
                                                                <Cpu size={12} className={algorithmDetails[record.algo]?.color || "text-slate-400"} />
                                                                <span className={`font-bold uppercase ${algorithmDetails[record.algo]?.color || "text-slate-200"}`}>{algorithmDetails[record.algo]?.title || record.algo}</span>
                                                            </div>
                                                            <div className="col-span-2 text-right text-cyan-400 font-bold">{record.visited}</div>
                                                            <div className="col-span-2 text-right text-emerald-400 font-bold">{record.path}</div>
                                                            <div className="col-span-2 text-right text-amber-400 font-bold">{record.time < 0.01 ? '< 0.01' : record.time.toFixed(2)}</div>
                                                            
                                                            <div className="col-span-2 flex justify-center gap-1.5">
                                                                <button 
                                                                    onClick={() => {
                                                                        setAlgorithm(record.algo); 
                                                                        if (record.mapData) {
                                                                            setRestoredMapData(record.mapData);
                                                                        }
                                                                        executeClearPath();        
                                                                        onClose();                 
                                                                        setTimeout(() => { executeRun(); }, 350); 
                                                                    }}
                                                                    className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors border border-cyan-500/20"
                                                                    title="Jalankan Ulang Algoritma Ini"
                                                                >
                                                                    <Play size={10} fill="currentColor" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => triggerDeleteSingleHistoryItem(idx)}
                                                                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 rounded-lg transition-colors border border-rose-500/20"
                                                                    title="Hapus Catatan Ini"
                                                                >
                                                                    <Trash2 size={10} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* TAB 2: GLOBAL LOGBOOK */}
                    {activeTab === 'global' && (
                        <div className="space-y-4">
                            {globalHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-4">
                                    <Archive size={48} className="opacity-20" />
                                    <p className="font-mono text-xs uppercase tracking-widest">Logbook global kosong.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Action Bar Multiple Delete */}
                                    <div className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedGroups.length === globalHistory.length}
                                                onChange={() => {
                                                    if (selectedGroups.length === globalHistory.length) {
                                                        setSelectedGroups([]);
                                                    } else {
                                                        setSelectedGroups(globalHistory.map(g => g.id));
                                                    }
                                                }}
                                                className="w-4 h-4 accent-emerald-500 rounded bg-[#050816] border-white/10 cursor-pointer"
                                            />
                                            <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold">
                                                Pilih Semua ({selectedGroups.length}/{globalHistory.length})
                                            </span>
                                        </label>

                                        {selectedGroups.length > 0 && (
                                            <button 
                                                onClick={triggerDeleteSelectedGroups}
                                                className="flex items-center gap-2 text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/30 transition-colors"
                                            >
                                                <Trash2 size={12} /> Hapus Terpilih
                                            </button>
                                        )}
                                    </div>

                                    {/* List Arsip */}
                                    {globalHistory.map(group => (
                                        <div key={group.id} className={`p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all border backdrop-blur-md ${selectedGroups.includes(group.id) ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/10'}`}>
                                            <div className="flex gap-3 items-start w-full md:w-auto flex-1">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedGroups.includes(group.id)}
                                                    onChange={() => {
                                                        setSelectedGroups(prev => 
                                                            prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id]
                                                        )
                                                    }}
                                                    className="w-4 h-4 mt-1 accent-emerald-500 rounded bg-[#050816] border-white/10 cursor-pointer"
                                                />
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-100">{group.name}</h4>
                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{group.date} • Map Template: <span className="text-emerald-400 uppercase font-bold">{group.template}</span></p>
                                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400 font-mono bg-[#050816]/50 p-2 rounded-lg border border-white/5">
                                                        {group.records.map((rec, rIdx) => (
                                                            <span key={rIdx}>
                                                                <b className={algorithmDetails[rec.algo]?.color}>{rec.algo.toUpperCase()}</b> ({rec.path}L / {rec.time.toFixed(1)}ms)
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons (Load & Delete Single) */}
                                            <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end ml-7 md:ml-0">
                                                <button 
                                                    onClick={() => {
                                                        setHistory([...group.records]);
                                                        setTemplateId(group.template);
                                                        
                                                        if (group.records.length > 0 && group.records[0].mapData) {
                                                            setRestoredMapData(group.records[0].mapData);
                                                            executeClearPath();
                                                        }
                                                        
                                                        setActiveTab('current');
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                                                >
                                                    <FolderOpen size={12} /> Muat
                                                </button>
                                                <button 
                                                    onClick={() => triggerDeleteSingleGroup(group.id)}
                                                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition-colors"
                                                    title="Hapus Grup Ini"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-5 border-t border-white/10 bg-white/5 flex gap-3">
                    {activeTab === 'current' && history.length > 0 && !isSessionSaved && (
                        <button onClick={handleOpenSaveDialog} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 uppercase transition-all shadow-inner">
                            <Save size={14} /> Simpan Sesi
                        </button>
                    )}
                    
                    <button 
                        onClick={() => {
                            if (activeTab === 'current') {
                                setDeleteDialog({ isOpen: true, title: "Kosongkan Sesi", message: "Yakin ingin menghapus seluruh riwayat di sesi aktif ini secara permanen?", actionType: 'clearCurrent' });
                            } else {
                                setDeleteDialog({ isOpen: true, title: "Format Arsip Global", message: "Tindakan ini akan menghapus SELURUH arsip yang tersimpan. Data tidak bisa dikembalikan. Yakin?", actionType: 'clearGlobal' });
                            }
                        }} 
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl hover:bg-rose-500/20 uppercase transition-all ml-auto shadow-inner"
                    >
                        <Trash2 size={14} /> {activeTab === 'current' ? 'Kosongkan Sesi Aktif' : 'Kosongkan Arsip Global'}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}