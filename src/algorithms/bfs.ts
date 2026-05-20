import { getNeighbors } from "./heuristic";
import { PathfindingResult } from "../types/algorithm";

export const runBFS = (nodes: number[], gridSize: number): PathfindingResult => {
    const startIdx = nodes.indexOf(1);
    const endIdx = nodes.indexOf(2);
    
    const visitedNodesInOrder: number[] = [];
    const queue: number[] = [startIdx];
    const visited = new Set<number>([startIdx]);
    const previousNodes: Record<number, number | null> = {};

    while (queue.length > 0) {
        const current = queue.shift()!; // Shift mengambil dari depan (Queue / FIFO)
        
        if (current === endIdx) break;
        if (current !== startIdx) visitedNodesInOrder.push(current);

        const neighbors = getNeighbors(current, gridSize, nodes);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor) && nodes[neighbor] < 3) {
                visited.add(neighbor);
                previousNodes[neighbor] = current;
                queue.push(neighbor);
            }
        }
    }

    const shortestPath: number[] = [];
    if (previousNodes[endIdx] !== undefined) {
        let currentNode: number | null = endIdx;
        while (currentNode !== null && currentNode !== startIdx) {
            shortestPath.unshift(currentNode);
            currentNode = previousNodes[currentNode] ?? null;
        }
    }

    return { visitedNodesInOrder, shortestPath };
};