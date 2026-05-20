// 1. Kumpulan nama algoritma yang sah (biar nggak typo pas ngetik)
export type AlgorithmType = 'astar' | 'dijkstra' | 'greedy' | 'bfs' | 'dfs';

// 2. Format standar hasil dari semua algoritma pencarian kita
export interface PathfindingResult {
    visitedNodesInOrder: number[];
    shortestPath: number[];
    executionTimeMs?: number; // Opsional (pakai ?)
    error?: string;           // Opsional
}

// 3. Format pesan yang dikirim dari React UI ke Web Worker
export interface WorkerMessageData {
    algorithm: AlgorithmType;
    nodes: number[];
    gridSize: number;
}