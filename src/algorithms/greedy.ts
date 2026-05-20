import { getNeighbors, manhattanDistance } from "./heuristic";
import { PathfindingResult } from "../types/algorithm";

export const runGreedyBFS = (nodes: number[], gridSize: number): PathfindingResult => {
    const startIdx = nodes.indexOf(1);
    const endIdx = nodes.indexOf(2);
    
    const visitedNodesInOrder: number[] = [];
    const openSet = new Set<number>([startIdx]);
    const closedSet = new Set<number>();
    const previousNodes: Record<number, number | null> = {};

    while (openSet.size > 0) {
        let current = -1;
        let lowestHScore = Infinity;

        for (const node of openSet) {
            const hScore = manhattanDistance(node, endIdx, gridSize);
            if (hScore < lowestHScore) {
                lowestHScore = hScore;
                current = node;
            }
        }

        if (current === endIdx) break;

        openSet.delete(current);
        closedSet.add(current);
        if (current !== startIdx) visitedNodesInOrder.push(current);

        const neighbors = getNeighbors(current, gridSize, nodes);
        for (const neighbor of neighbors) {
            if (closedSet.has(neighbor) || nodes[neighbor] >= 3) continue;

            if (!openSet.has(neighbor)) {
                previousNodes[neighbor] = current;
                openSet.add(neighbor);
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