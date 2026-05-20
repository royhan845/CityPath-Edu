// Mencari tetangga (atas, bawah, kiri, kanan) yang bisa dilewati
export const getNeighbors = (node: number, gridSize: number, nodes: number[]): number[] => {
    const neighbors: number[] = [];
    const row = Math.floor(node / gridSize);
    const col = node % gridSize;

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Atas, Bawah, Kiri, Kanan
    
    for (const [dr, dc] of dirs) {
        const r = row + dr;
        const c = col + dc;
        
        if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
            const idx = r * gridSize + c;
            // 0 = Kosong/Walkable, 2 = Target End
            if (nodes[idx] === 0 || nodes[idx] === 2) {
                neighbors.push(idx);
            }
        }
    }
    return neighbors;
}

// Menghitung jarak estimasi (Heuristic) menggunakan Manhattan Distance
export const manhattanDistance = (node1: number, node2: number, gridSize: number): number => {
    const r1 = Math.floor(node1 / gridSize);
    const c1 = node1 % gridSize;
    const r2 = Math.floor(node2 / gridSize);
    const c2 = node2 % gridSize;
    return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}