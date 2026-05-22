export type AlgoType = 'astar' | 'dijkstra' | 'greedy' | 'bfs' | 'dfs';

export function solvePathfinding(algo: AlgoType) {
    const GRID_SIZE = 8;
    const START = 0;
    const END = 63; // 8x8 - 1

    const visited: number[] = [];
    const path: number[] = [];
    const parents: Record<number, number> = {};

    // Helper: Konversi index 1D ke koordinat 2D (X, Y)
    const getCoord = (idx: number) => ({ x: idx % GRID_SIZE, y: Math.floor(idx / GRID_SIZE) });
    
    // Heuristik: Manhattan Distance murni
    const getH = (idx: number) => {
        const a = getCoord(idx);
        const b = getCoord(END);
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    };

    // Helper: Ambil tetangga (Urutan prioritas: Kanan, Bawah, Kiri, Atas)
    const getNeighbors = (idx: number) => {
        const neighbors: number[] = [];
        const { x, y } = getCoord(idx);
        if (x < GRID_SIZE - 1) neighbors.push(idx + 1);          // Kanan
        if (y < GRID_SIZE - 1) neighbors.push(idx + GRID_SIZE);  // Bawah
        if (x > 0) neighbors.push(idx - 1);                      // Kiri
        if (y > 0) neighbors.push(idx - GRID_SIZE);              // Atas
        return neighbors;
    };

    // ==========================================
    // 1. BREADTH-FIRST SEARCH (Queue / Antrean FIFO)
    // ==========================================
    if (algo === 'bfs') {
        const queue = [START];
        const seen = new Set([START]);
        while (queue.length > 0) {
            const curr = queue.shift()!;
            visited.push(curr);
            if (curr === END) break;
            
            for (const n of getNeighbors(curr)) {
                if (!seen.has(n)) {
                    seen.add(n);
                    parents[n] = curr;
                    queue.push(n);
                }
            }
        }
    } 
    // ==========================================
    // 2. DEPTH-FIRST SEARCH (Stack / Tumpukan LIFO)
    // ==========================================
    else if (algo === 'dfs') {
        const stack = [START];
        const seen = new Set([START]);
        while (stack.length > 0) {
            const curr = stack.pop()!;
            visited.push(curr);
            if (curr === END) break;
            
            // Reverse agar Kanan/Bawah diproses terakhir (paling atas di stack)
            const neighbors = getNeighbors(curr).reverse(); 
            for (const n of neighbors) {
                if (!seen.has(n)) {
                    seen.add(n);
                    parents[n] = curr;
                    stack.push(n);
                }
            }
        }
    }
    // ==========================================
    // 3. A*, DIJKSTRA, GREEDY (Priority Queue)
    // ==========================================
    else {
        const openSet = [START];
        const gScore: Record<number, number> = { [START]: 0 };
        const seen = new Set([START]);

        while (openSet.length > 0) {
            // Sort berdasarkan karakteristik masing-masing algoritma
            openSet.sort((a, b) => {
                const gA = gScore[a];
                const gB = gScore[b];
                const hA = getH(a);
                const hB = getH(b);
                
                if (algo === 'astar') {
                    // A* menggunakan F = G + H
                    const fA = gA + hA;
                    const fB = gB + hB;
                    // Jika F sama, pilih yang paling dekat dengan target (H terkecil)
                    if (fA === fB) return hA - hB; 
                    return fA - fB;
                }
                
                if (algo === 'dijkstra') {
                    // DIJKSTRA MURNI: Buta arah. Hanya peduli jarak dari start (G)
                    // Jika G seri, biarkan urutan array alami (menghasilkan pola menyebar merata)
                    return gA - gB; 
                }
                
                if (algo === 'greedy') {
                    // GREEDY MURNI: Mengabaikan jarak dari start. Fokus 100% ke target (H)
                    return hA - hB; 
                }
                
                return 0;
            });

            const curr = openSet.shift()!;
            visited.push(curr);
            if (curr === END) break;

            for (const n of getNeighbors(curr)) {
                const tentativeG = gScore[curr] + 1;
                if (!seen.has(n) || tentativeG < (gScore[n] || Infinity)) {
                    parents[n] = curr;
                    gScore[n] = tentativeG;
                    if (!seen.has(n)) {
                        seen.add(n);
                        openSet.push(n);
                    }
                }
            }
        }
    }

    // ==========================================
    // REKONSTRUKSI RUTE TERBAIK
    // ==========================================
    let curr = END;
    if (parents[END] !== undefined) {
        while (curr !== undefined) {
            path.unshift(curr);
            curr = parents[curr];
            if (curr === START) { path.unshift(START); break; }
        }
    }

    return { v: visited, p: path };
}