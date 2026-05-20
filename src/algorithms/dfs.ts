import { getNeighbors } from "./heuristic";
import { PathfindingResult } from "../types/algorithm";

export const runDFS = (nodes: number[], gridSize: number): PathfindingResult => {
    const startIdx = nodes.indexOf(1);
    const endIdx = nodes.indexOf(2);
    
    const visitedNodesInOrder: number[] = [];
    const stack: number[] = [startIdx];
    const visited = new Set<number>([startIdx]);
    const previousNodes: Record<number, number | null> = {};

    while (stack.length > 0) {
        const current = stack.pop()!; // Pop mengambil dari belakang (Stack / LIFO)
        
        if (current === endIdx) break;
        if (current !== startIdx) visitedNodesInOrder.push(current);

        const neighbors = getNeighbors(current, gridSize, nodes);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor) && nodes[neighbor] < 3) {
                visited.add(neighbor);
                previousNodes[neighbor] = current;
                stack.push(neighbor);
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