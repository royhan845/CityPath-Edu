import { BUILDINGS, GRID_SIZE, SURFACE_Y, DEFAULT_SIM_SPEED } from "../config" 

export function generateTemplateMap(templateId: string) {
    const initial = Array(GRID_SIZE * GRID_SIZE).fill(0);
    const rots: Record<number, number> = {};
    
    // 1. TENTUKAN POSISI KARAKTER
    let sRow = 0, sCol = 0, sRot = 1; 
    let eRow = GRID_SIZE - 1, eCol = GRID_SIZE - 1, eRot = 3; 

    if (templateId === 'maze') {
        sRow = 0; sCol = 0; sRot = 1; 
        eRow = 10; eCol = 10; eRot = 2;
    } else if (templateId === 'urban') {
        sRow = 1; sCol = 1; sRot = 1; 
        eRow = 18; eCol = 18; eRot = 3; 
    } else if (templateId === 'industrial') {
        sRow = 0; sCol = 0; sRot = 1;
        eRow = 18; eCol = 0; eRot = 0;
    }

    const startIdx = sRow * GRID_SIZE + sCol; 
    const endIdx = eRow * GRID_SIZE + eCol; 
    initial[startIdx] = 1; 
    initial[endIdx] = 2; 
    rots[startIdx] = sRot;
    rots[endIdx] = eRot;

    if (templateId === 'empty') {
        return { newNodes: initial, newRotations: rots };
    }

    // FUNGSI PENANAM INTERNAL
    const safePlace = (row: number, col: number, bldId: number, rStep: number, padding: number = 0) => {
        const bld = Object.values(BUILDINGS).find(b => b.id === bldId);
        if (!bld) return;
        
        const sizeX = (rStep % 2 !== 0) ? bld.sizeZ : bld.sizeX;
        const sizeZ = (rStep % 2 !== 0) ? bld.sizeX : bld.sizeZ;

        if (row + sizeX > GRID_SIZE || col + sizeZ > GRID_SIZE) return;

        for (let r = -padding; r < sizeX + padding; r++) {
            for (let c = -padding; c < sizeZ + padding; c++) {
                const checkR = row + r;
                const checkC = col + c;
                if (checkR >= 0 && checkR < GRID_SIZE && checkC >= 0 && checkC < GRID_SIZE) {
                    const idx = checkR * GRID_SIZE + checkC;
                    if (idx === startIdx || idx === endIdx || initial[idx] !== 0) return; 
                }
            }
        }

        const anchorIdx = row * GRID_SIZE + col;
        for (let r = 0; r < sizeX; r++) {
            for (let c = 0; c < sizeZ; c++) {
                initial[(row + r) * GRID_SIZE + (col + c)] = 3; 
            }
        }
        
        initial[anchorIdx] = bldId; 
        rots[anchorIdx] = rStep;    
    };

    const ran1x1 = (r: number, c: number) => [7, 8, 9, 10][(r + c) % 4];
    const ran2x1 = (r: number, c: number) => [11, 12, 13][(r + c) % 3];

    // ==========================================
    // TEMA 1: LABYRINTH (Labirin Sejati Berliku)
    // ==========================================
    if (templateId === 'maze') {
        // Spiral masuk dengan banyak jalan buntu untuk menjebak algoritma
        for (let i = 2; i <= 18; i++) {
            // Dinding Horizontal
            if (i < 16) safePlace(2, i, ran1x1(2,i), 0, 0); 
            if (i > 2 && i < 16) safePlace(6, i, ran1x1(6,i), 0, 0); 
            if (i > 4 && i < 18) safePlace(10, i, ran1x1(10,i), 0, 0); 
            if (i > 2 && i < 16) safePlace(14, i, ran1x1(14,i), 0, 0); 
            if (i < 18) safePlace(18, i, ran1x1(18,i), 0, 0); 

            // Dinding Vertikal untuk membuat jalan buntu (Dead Ends)
            if (i > 2 && i < 8) safePlace(i, 16, ran1x1(i,16), 0, 0);
            if (i > 10 && i < 16) safePlace(i, 2, ran1x1(i,2), 0, 0);
            if (i > 6 && i < 12) safePlace(i, 18, ran1x1(i,18), 0, 0);
            if (i > 14 && i < 18) safePlace(i, 16, ran1x1(i,16), 0, 0);
        }
        
        // Tambahan penjebak di tengah
        safePlace(8, 8, ran1x1(8,8), 0, 0);
        safePlace(8, 9, ran1x1(8,9), 0, 0);
        safePlace(9, 8, ran1x1(9,8), 0, 0);
    } 
    // ==========================================
    // TEMA 2: DOWNTOWN (Pemukiman Kumuh / Tidak Simetris)
    // ==========================================
    else if (templateId === 'urban') {
        // Menyebar gedung dengan acak dan menyisakan gang-gang sempit (1 blok)
        for (let r = 1; r < GRID_SIZE - 1; r += 3) {
            for (let c = 1; c < GRID_SIZE - 1; c += 3) {
                // Jangan tutup titik awal dan akhir
                if ((r < 3 && c < 3) || (r > 15 && c > 15)) continue;

                const pattern = (r * 7 + c * 3) % 5;
                
                if (pattern === 0) {
                    safePlace(r, c, 14, 0, 0); // Gedung 2x2
                } else if (pattern === 1) {
                    safePlace(r, c, ran2x1(r,c), 0, 0); // 2x1 Horizontal
                    safePlace(r+1, c+1, ran1x1(r,c), 0, 0); // 1x1 Nyempil
                } else if (pattern === 2) {
                    safePlace(r, c, ran2x1(r,c), 1, 0); // 1x2 Vertikal
                    safePlace(r+1, c+2, ran2x1(r,c), 1, 0); // 1x2 Vertikal
                } else if (pattern === 3) {
                    safePlace(r, c, ran1x1(r,c), 0, 0);
                    safePlace(r+1, c, ran1x1(r+1,c), 0, 0);
                    safePlace(r, c+2, ran1x1(r,c+2), 0, 0);
                }
            }
        }
        // Pasang barikade di tengah agar algoritma dipaksa muter jauh
        for(let i=4; i<=15; i++) {
            safePlace(i, 9, ran1x1(i,9), 0, 0);
            safePlace(i, 10, ran1x1(i,10), 0, 0);
        }
    } 
    // ==========================================
    // TEMA 3: INDUSTRIAL (Zig-Zag Ekstrim)
    // ==========================================
    else if (templateId === 'industrial') {
        // Karakter dipaksa berjalan bolak-balik (Snake pattern)
        for (let r = 2; r <= 16; r += 4) {
            // Tembok dari Kiri ke Kanan (ada celah di kanan)
            for (let c = 0; c <= 17; c++) {
                safePlace(r, c, ran1x1(r,c), 0, 0);
            }
            
            // Tembok dari Kanan ke Kiri (ada celah di kiri)
            if (r + 2 <= 16) {
                for (let c = 2; c <= 19; c++) {
                    safePlace(r + 2, c, ran1x1(r+2,c), 0, 0);
                }
            }
        }
        
        // Hiasan tambahan agar terlihat seperti pabrik padat
        safePlace(1, 10, 14, 0, 0);  // Tangki di atas
        safePlace(1, 15, 11, 0, 0);  // Cerobong
        safePlace(5, 5, 14, 0, 0);   
        safePlace(9, 14, 11, 0, 0);  
        safePlace(13, 3, 14, 0, 0);  
        safePlace(17, 16, 11, 0, 0); 
    }

    return { newNodes: initial, newRotations: rots };
}