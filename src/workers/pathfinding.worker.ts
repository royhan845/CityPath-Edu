import { runAStar, runDijkstra, runGreedyBFS, runBFS, runDFS } from "../algorithms";
import { AlgorithmType, PathfindingResult, WorkerMessageData } from "../types/algorithm";

// Mendengarkan perintah dari Main Thread (React UI)
self.addEventListener("message", (e: MessageEvent<WorkerMessageData>) => {
    const { algorithm, nodes, gridSize } = e.data;
    
    const startTime = performance.now();
    let result: PathfindingResult = { visitedNodesInOrder: [], shortestPath: [] };

    try {
        switch (algorithm) {
            case "astar":
                result = runAStar(nodes, gridSize);
                break;
            case "dijkstra":
                result = runDijkstra(nodes, gridSize);
                break;
            case "greedy":
                result = runGreedyBFS(nodes, gridSize);
                break;
            case "bfs":
                result = runBFS(nodes, gridSize);
                break;
            case "dfs":
                result = runDFS(nodes, gridSize);
                break;
            default:
                throw new Error("Algoritma tidak dikenali.");
        }
        
        result.executionTimeMs = performance.now() - startTime;
        
        // Kirim hasil kembali ke Main Thread
        self.postMessage(result);
        
    } catch (error: any) {
        self.postMessage({ error: error.message, visitedNodesInOrder: [], shortestPath: [] });
    }
});

// Penting untuk TypeScript agar mengenali file ini sebagai module worker
export {};