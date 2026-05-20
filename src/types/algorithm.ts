export type AlgorithmType = 'astar' | 'dijkstra' | 'greedy' | 'bfs' | 'dfs';

export interface PathfindingResult {
    visitedNodesInOrder: number[];
    shortestPath: number[];
    executionTimeMs?: number;
    error?: string;
}

export interface WorkerMessageData {
    algorithm: AlgorithmType;
    nodes: number[];
    gridSize: number;
}