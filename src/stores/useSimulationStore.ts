import { create } from 'zustand'

export interface GlobalLogGroup { 
    id: string; 
    name: string; 
    date: string; 
    template: string; 
    records: { algo: string, visited: number, path: number, time: number, mapData?: any }[]; 
    mapState?: any; 
}

export interface HistoryRecord { 
    algo: string, 
    visited: number, 
    path: number, 
    time: number, 
    mapData?: any 
}

interface SimulationState {
    algorithm: string;
    drawMode: string;
    rotationStep: number;
    templateId: string;
    simSpeed: number;
    playbackStatus: 'idle' | 'playing' | 'paused';
    liveText: string;

    skipTrigger: number;

    stats: { visited: number, path: number, time: number } | null;
    history: HistoryRecord[];
    
    restoredMapData: any;
    setRestoredMapData: (data: any) => void;
    
    globalHistory: GlobalLogGroup[];

    hasNewReport: boolean;
    setHasNewReport: (val: boolean) => void;
    
    showTutorial: boolean;

    runTrigger: number;
    clearPathTrigger: number;
    clearBoardTrigger: number;
    stepForwardTrigger: number;
    stepBackwardTrigger: number;
    stopTrigger: number;

    setAlgorithm: (val: string) => void;
    setDrawMode: (val: string) => void;
    setRotationStep: (val: number | ((prev: number) => number)) => void;
    setTemplateId: (val: string) => void;
    setSimSpeed: (val: number) => void;
    setPlaybackStatus: (val: 'idle' | 'playing' | 'paused') => void;
    setLiveText: (val: string) => void;

    setStats: (stats: { visited: number, path: number, time: number } | null) => void;
    setHistory: (history: HistoryRecord[]) => void;
    addHistory: (record: HistoryRecord) => void;
    
    setGlobalHistory: (val: GlobalLogGroup[]) => void;
    addGlobalHistory: (record: GlobalLogGroup) => void;
    clearGlobalHistory: () => void;

    setShowTutorial: (show: boolean) => void;
    clearHistory: () => void;

    executeRun: () => void;
    executeSkip: () => void;
    executeClearPath: () => void;
    executeClearBoard: () => void;
    executeStepForward: () => void;
    executeStepBackward: () => void;
    executeStop: () => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
    algorithm: 'astar',
    drawMode: 'start',
    rotationStep: 0,
    templateId: 'empty',
    simSpeed: 50,
    playbackStatus: 'idle',
    liveText: "Sistem Siap. Silakan bangun rintangan atau pilih template.",

    skipTrigger: 0,
    
    stats: null,
    history: [],
    
    restoredMapData: null,

    globalHistory: [],
    hasNewReport: false,

    showTutorial: false,

    runTrigger: 0, clearPathTrigger: 0, clearBoardTrigger: 0,
    stepForwardTrigger: 0, stepBackwardTrigger: 0, stopTrigger: 0,

    setAlgorithm: (val) => set({ algorithm: val }),
    setDrawMode: (val) => set({ drawMode: val }),
    setRotationStep: (val) => set((state) => ({ rotationStep: typeof val === 'function' ? val(state.rotationStep) : val })),
    setTemplateId: (val) => set({ templateId: val }),
    setSimSpeed: (val) => set({ simSpeed: val }),
    setPlaybackStatus: (val) => set({ playbackStatus: val }),
    setLiveText: (val) => set({ liveText: val }),

    setStats: (stats) => set({ stats }),
    setHasNewReport: (val) => set({ hasNewReport: val }),
    
    setRestoredMapData: (data) => set({ restoredMapData: data }),
    setHistory: (history) => set({ history }),
    
    addHistory: (record) => set((state) => {
        // 1. PENGECEKAN KONSISTENSI MAP (Auto-Archive)
        if (state.history.length > 0) {
            const prevNodes = JSON.stringify(state.history[0].mapData?.nodes || []);
            const currNodes = JSON.stringify(record.mapData?.nodes || []);

            if (prevNodes !== currNodes) {
                const autoSavedGroup: GlobalLogGroup = {
                    id: Date.now().toString(),
                    name: `Auto-Save (Perubahan Map)`,
                    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
                    template: state.templateId || 'custom',
                    records: [...state.history]
                };
                
                return { 
                    globalHistory: [autoSavedGroup, ...state.globalHistory],
                    history: [record] 
                };
            }
        }

        // 2. PENGECEKAN DUPLIKASI (Hanya berjalan jika map-nya sama persis)
        const isDuplicate = state.history.some(
            (h) => h.algo === record.algo && h.visited === record.visited && h.path === record.path
        );
        if (isDuplicate) return state;

        // 3. JIKA MAP SAMA DAN TIDAK DUPLIKAT, TAMBAHKAN KE TABEL
        return { history: [...state.history, record] };
    }),
    
    setGlobalHistory: (val) => set({ globalHistory: val }),
    addGlobalHistory: (record) => set((state) => ({ globalHistory: [record, ...state.globalHistory] })),
    clearGlobalHistory: () => set({ globalHistory: [] }),

    setShowTutorial: (show) => set({ showTutorial: show }),
    clearHistory: () => set({ history: [], stats: null }),

    executeRun: () => set((s) => ({ runTrigger: s.runTrigger + 1, playbackStatus: 'playing' })),
    executeSkip: () => set((s) => ({ skipTrigger: s.skipTrigger + 1 })),
    executeClearPath: () => set((s) => ({ clearPathTrigger: s.clearPathTrigger + 1, playbackStatus: 'idle' })),
    executeClearBoard: () => set((s) => ({ clearBoardTrigger: s.clearBoardTrigger + 1, playbackStatus: 'idle' })),
    executeStepForward: () => set((s) => ({ stepForwardTrigger: s.stepForwardTrigger + 1, playbackStatus: 'paused' })),
    executeStepBackward: () => set((s) => ({ stepBackwardTrigger: s.stepBackwardTrigger + 1, playbackStatus: 'paused' })),
    executeStop: () => set((s) => ({ stopTrigger: s.stopTrigger + 1, playbackStatus: 'idle' })),
}))