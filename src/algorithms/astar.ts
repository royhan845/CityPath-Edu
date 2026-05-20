import { getNeighbors, manhattanDistance } from "./heuristic";
import { PathfindingResult } from "../types/algorithm";

export const runAStar = (nodes: number[], gridSize: number): PathfindingResult => {
    const startIdx = nodes.indexOf(1);
    const endIdx = nodes.indexOf(2);
    
    const visitedNodesInOrder: number[] = [];
    const openSet = new Set<number>(); 
    const closedSet = new Set<number>(); 
    const previousNodes: Record<number, number | null> = {};
    const gScore: Record<number, number> = {}; 
    const fScore: Record<number, number> = {}; 

    // 1. Inisialisasi default score
    for (let i = 0; i < nodes.length; i++) {
        gScore[i] = Infinity; 
        fScore[i] = Infinity; 
        previousNodes[i] = null;
    }
    
    gScore[startIdx] = 0; 
    fScore[startIdx] = manhattanDistance(startIdx, endIdx, gridSize);
    openSet.add(startIdx);

    // 2. Loop Pencarian
    while (openSet.size > 0) {
        let current = -1; 
        let lowestFScore = Infinity;
        
        // Cari node dengan fScore terendah
        for (const node of openSet) {
            if (fScore[node] < lowestFScore) { 
                lowestFScore = fScore[node]; 
                current = node; 
            }
        }
        
        // Jika sudah sampai tujuan
        if (current === endIdx) break;
        
        openSet.delete(current); 
        closedSet.add(current);
        if (current !== startIdx) visitedNodesInOrder.push(current);

        // 3. Evaluasi Tetangga (Perhatikan parameter 'nodes' ditambahkan di sini)
        const neighbors = getNeighbors(current, gridSize, nodes);
        
        for (const neighbor of neighbors) {
            // Hindari obstacle (di atas 3) dan yang sudah dievaluasi
            if (nodes[neighbor] >= 3 || closedSet.has(neighbor)) continue;
            
            const tentativeGScore = gScore[current] + 1; // Jarak 1 langkah
            
            if (!openSet.has(neighbor)) {
                openSet.add(neighbor); 
            } else if (tentativeGScore >= gScore[neighbor]) {
                continue; 
            }

            // Catat rute terbaik sejauh ini
            previousNodes[neighbor] = current;
            gScore[neighbor] = tentativeGScore;
            fScore[neighbor] = gScore[neighbor] + manhattanDistance(neighbor, endIdx, gridSize);
        }
    }
    
    // 4. Rekonstruksi Jalur Terpendek
    const shortestPath: number[] = [];
    if (previousNodes[endIdx] !== null) {
        let currentNode: number | null = endIdx;
        while (currentNode !== null && currentNode !== startIdx) {
            shortestPath.unshift(currentNode); 
            currentNode = previousNodes[currentNode];
        }
    }
    
    return { visitedNodesInOrder, shortestPath };
};