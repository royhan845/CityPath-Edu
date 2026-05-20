import { getNeighbors } from "./heuristic";
import { PathfindingResult } from "../types/algorithm";

export const runDijkstra = (nodes: number[], gridSize: number): PathfindingResult => {
    const startIdx = nodes.indexOf(1);
    const endIdx = nodes.indexOf(2);
    
    const visitedNodesInOrder: number[] = [];
    const unvisitedNodes = new Set<number>();
    const distances: Record<number, number> = {};
    const previousNodes: Record<number, number | null> = {};

    for (let i = 0; i < nodes.length; i++) {
        distances[i] = Infinity;
        previousNodes[i] = null;
        unvisitedNodes.add(i);
    }
    distances[startIdx] = 0;

    while (unvisitedNodes.size > 0) {
        let current = -1;
        let shortestDistance = Infinity;

        // Cari node terdekat di unvisited set
        for (const node of unvisitedNodes) {
            if (distances[node] < shortestDistance) {
                shortestDistance = distances[node];
                current = node;
            }
        }

        // Jika terperangkap (semua node sisa Infinity) atau sudah sampai target
        if (current === -1 || distances[current] === Infinity) break;
        if (current === endIdx) break;

        unvisitedNodes.delete(current);
        if (current !== startIdx) visitedNodesInOrder.push(current);

        const neighbors = getNeighbors(current, gridSize, nodes);
        for (const neighbor of neighbors) {
            if (!unvisitedNodes.has(neighbor) || nodes[neighbor] >= 3) continue;

            const altDistance = distances[current] + 1; // +1 karena grid tanpa bobot tanah
            if (altDistance < distances[neighbor]) {
                distances[neighbor] = altDistance;
                previousNodes[neighbor] = current;
            }
        }
    }

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