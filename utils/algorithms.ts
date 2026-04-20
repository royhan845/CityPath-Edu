// utils/algorithms.ts

export const getNeighbors = (index: number, gridSize: number) => {
    const neighbors = [];
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    if (row > 0) neighbors.push(index - gridSize); // Atas
    if (row < gridSize - 1) neighbors.push(index + gridSize); // Bawah
    if (col > 0) neighbors.push(index - 1); // Kiri
    if (col < gridSize - 1) neighbors.push(index + 1); // Kanan

    return neighbors;
}

// Helper untuk Heuristik (Jarak)
const getDistance = (nodeA: number, nodeB: number, gridSize: number) => {
    const rowA = Math.floor(nodeA / gridSize);
    const colA = nodeA % gridSize;
    const rowB = Math.floor(nodeB / gridSize);
    const colB = nodeB % gridSize;
    return Math.abs(rowA - rowB) + Math.abs(colA - colB);
};

// --- ALGORITMA 1: DIJKSTRA ---
export const runDijkstra = (nodes: number[], gridSize: number) => {
    const startIdx = nodes.indexOf(1);
    const endIdx = nodes.indexOf(2);
    const visitedNodesInOrder: number[] = [];
    const distances: Record<number, number> = {};
    const previousNodes: Record<number, number | null> = {};
    const unvisited = new Set<number>();

    for (let i = 0; i < nodes.length; i++) {
        distances[i] = Infinity;
        previousNodes[i] = null;
        if (nodes[i] === 0 || nodes[i] === 1 || nodes[i] === 2) unvisited.add(i);
    }
    distances[startIdx] = 0;

    while (unvisited.size > 0) {
        let closestNode = -1;
        let minDistance = Infinity;
        for (const node of unvisited) {
            if (distances[node] < minDistance) { minDistance = distances[node]; closestNode = node; }
        }
        if (closestNode === -1 || minDistance === Infinity) break;
        unvisited.delete(closestNode);
        if (closestNode !== startIdx && closestNode !== endIdx) visitedNodesInOrder.push(closestNode);
        if (closestNode === endIdx) break;

        const neighbors = getNeighbors(closestNode, gridSize);
        for (const neighbor of neighbors) {
            if (unvisited.has(neighbor)) {
                const newDist = distances[closestNode] + 1;
                if (newDist < distances[neighbor]) {
                    distances[neighbor] = newDist;
                    previousNodes[neighbor] = closestNode;
                }
            }
        }
    }
    const shortestPath: number[] = [];
    if (previousNodes[endIdx] !== null) {
        let currentNode: number | null = endIdx;
        while (currentNode !== null && currentNode !== startIdx && currentNode !== undefined) {
            shortestPath.unshift(currentNode); currentNode = previousNodes[currentNode];
        }
    }
    return { visitedNodesInOrder, shortestPath };
}

// --- ALGORITMA 2: A-STAR (A*) ---
export const runAStar = (nodes: number[], gridSize: number) => {
    const startIdx = nodes.indexOf(1);
    const endIdx = nodes.indexOf(2);
    const visitedNodesInOrder: number[] = [];
    const openSet = new Set<number>(); 
    const closedSet = new Set<number>(); 
    const previousNodes: Record<number, number | null> = {};
    const gScore: Record<number, number> = {}; 
    const fScore: Record<number, number> = {}; 

    for (let i = 0; i < nodes.length; i++) {
        gScore[i] = Infinity; fScore[i] = Infinity; previousNodes[i] = null;
    }
    gScore[startIdx] = 0; fScore[startIdx] = getDistance(startIdx, endIdx, gridSize);
    openSet.add(startIdx);

    while (openSet.size > 0) {
        let current = -1; let lowestFScore = Infinity;
        for (const node of openSet) {
            if (fScore[node] < lowestFScore) { lowestFScore = fScore[node]; current = node; }
        }
        if (current === endIdx) break;
        openSet.delete(current); closedSet.add(current);
        if (current !== startIdx) visitedNodesInOrder.push(current);

        const neighbors = getNeighbors(current, gridSize);
        for (const neighbor of neighbors) {
            if (nodes[neighbor] >= 3 || closedSet.has(neighbor)) continue;
            const tentativeGScore = gScore[current] + 1;
            if (!openSet.has(neighbor)) openSet.add(neighbor); 
            else if (tentativeGScore >= gScore[neighbor]) continue; 

            previousNodes[neighbor] = current;
            gScore[neighbor] = tentativeGScore;
            fScore[neighbor] = gScore[neighbor] + getDistance(neighbor, endIdx, gridSize);
        }
    }
    const shortestPath: number[] = [];
    if (previousNodes[endIdx] !== null) {
        let currentNode: number | null = endIdx;
        while (currentNode !== null && currentNode !== startIdx && currentNode !== undefined) {
            shortestPath.unshift(currentNode); currentNode = previousNodes[currentNode];
        }
    }
    return { visitedNodesInOrder, shortestPath };
};

// --- ALGORITMA 3: BREADTH-FIRST SEARCH (BFS) ---
export const runBFS = (nodes: number[], gridSize: number) => {
    const startIdx = nodes.indexOf(1);
    const endIdx = nodes.indexOf(2);
    const visitedNodesInOrder: number[] = [];
    const previousNodes: Record<number, number | null> = {};
    const visited = new Set<number>();
    const queue: number[] = [startIdx];

    visited.add(startIdx);

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (current !== startIdx && current !== endIdx) visitedNodesInOrder.push(current);
        if (current === endIdx) break;

        const neighbors = getNeighbors(current, gridSize);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor) && nodes[neighbor] < 3) {
                visited.add(neighbor);
                previousNodes[neighbor] = current;
                queue.push(neighbor);
            }
        }
    }
    const shortestPath: number[] = [];
    if (visited.has(endIdx)) {
        let curr: number | null = endIdx;
        while (curr !== null && curr !== startIdx) {
            shortestPath.unshift(curr); curr = previousNodes[curr] !== undefined ? previousNodes[curr] : null;
        }
    }
    return { visitedNodesInOrder, shortestPath };
}

// --- ALGORITMA 4: DEPTH-FIRST SEARCH (DFS) ---
export const runDFS = (nodes: number[], gridSize: number) => {
    const startIdx = nodes.indexOf(1);
    const endIdx = nodes.indexOf(2);
    const visitedNodesInOrder: number[] = [];
    const previousNodes: Record<number, number | null> = {};
    const visited = new Set<number>();
    const stack: number[] = [startIdx];

    while (stack.length > 0) {
        const current = stack.pop()!;
        if (visited.has(current)) continue;
        visited.add(current);

        if (current !== startIdx && current !== endIdx) visitedNodesInOrder.push(current);
        if (current === endIdx) break;

        const neighbors = getNeighbors(current, gridSize);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor) && nodes[neighbor] < 3) {
                previousNodes[neighbor] = current; 
                stack.push(neighbor);
            }
        }
    }
    const shortestPath: number[] = [];
    if (visited.has(endIdx)) {
        let curr: number | null = endIdx;
        while (curr !== null && curr !== startIdx) {
            shortestPath.unshift(curr); curr = previousNodes[curr] !== undefined ? previousNodes[curr] : null;
        }
    }
    return { visitedNodesInOrder, shortestPath };
}

// --- ALGORITMA 5: GREEDY BEST-FIRST SEARCH ---
export const runGreedyBFS = (nodes: number[], gridSize: number) => {
    const startIdx = nodes.indexOf(1);
    const endIdx = nodes.indexOf(2);
    const visitedNodesInOrder: number[] = [];
    const previousNodes: Record<number, number | null> = {};
    const visited = new Set<number>();
    const openSet = new Set<number>();
    
    openSet.add(startIdx);

    while (openSet.size > 0) {
        let current = -1; let minHeuristic = Infinity;
        for (const node of openSet) {
            const h = getDistance(node, endIdx, gridSize);
            if (h < minHeuristic) { minHeuristic = h; current = node; }
        }
        if (current === -1) break;

        openSet.delete(current); visited.add(current);
        if (current !== startIdx && current !== endIdx) visitedNodesInOrder.push(current);
        if (current === endIdx) break;

        const neighbors = getNeighbors(current, gridSize);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor) && !openSet.has(neighbor) && nodes[neighbor] < 3) {
                previousNodes[neighbor] = current; openSet.add(neighbor);
            }
        }
    }
    const shortestPath: number[] = [];
    if (visited.has(endIdx)) {
        let curr: number | null = endIdx;
        while (curr !== null && curr !== startIdx) {
            shortestPath.unshift(curr); curr = previousNodes[curr] !== undefined ? previousNodes[curr] : null;
        }
    }
    return { visitedNodesInOrder, shortestPath };
}