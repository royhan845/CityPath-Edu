import { create } from 'zustand'

export interface GlobalLogGroup { 
    id: string; 
    name: string; 
    date: string; 
    template: string; 
    records: { algo: string, visited: number, path: number, time: number }[]; 
    mapState?: any; 
}

interface SimulationState {
    algorithm: string;
    drawMode: string;
    rotationStep: number;
    templateId: string;
    simSpeed: number;
    playbackStatus: 'idle' | 'playing' | 'paused';
    liveText: string;

    stats: { visited: number, path: number, time: number } | null;
    history: { algo: string, visited: number, path: number, time: number }[];
    
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
    addHistory: (record: { algo: string, visited: number, path: number, time: number }) => void;
    setHistory: (history: { algo: string, visited: number, path: number, time: number }[]) => void;
    
    setGlobalHistory: (val: GlobalLogGroup[]) => void;
    addGlobalHistory: (record: GlobalLogGroup) => void;
    clearGlobalHistory: () => void;

    setShowTutorial: (show: boolean) => void;
    clearHistory: () => void;

    executeRun: () => void;
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

    stats: null,
    history: [],
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
    setHistory: (history) => set({ history }),
    addHistory: (record) => set((state) => {
        const isDuplicate = state.history.some(
            (h) => h.algo === record.algo && h.visited === record.visited && h.path === record.path
        );
        if (isDuplicate) return state;
        return { history: [...state.history, record] };
    }),
    
    setGlobalHistory: (val) => set({ globalHistory: val }),
    addGlobalHistory: (record) => set((state) => ({ globalHistory: [record, ...state.globalHistory] })),
    clearGlobalHistory: () => set({ globalHistory: [] }),

    setShowTutorial: (show) => set({ showTutorial: show }),
    clearHistory: () => set({ history: [], stats: null }),

    executeRun: () => set((s) => ({ runTrigger: s.runTrigger + 1, playbackStatus: 'playing' })),
    executeClearPath: () => set((s) => ({ clearPathTrigger: s.clearPathTrigger + 1, playbackStatus: 'idle' })),
    executeClearBoard: () => set((s) => ({ clearBoardTrigger: s.clearBoardTrigger + 1, playbackStatus: 'idle' })),
    executeStepForward: () => set((s) => ({ stepForwardTrigger: s.stepForwardTrigger + 1, playbackStatus: 'paused' })),
    executeStepBackward: () => set((s) => ({ stepBackwardTrigger: s.stepBackwardTrigger + 1, playbackStatus: 'paused' })),
    executeStop: () => set((s) => ({ stopTrigger: s.stopTrigger + 1, playbackStatus: 'idle' })),
}))