import { BUILDINGS, GRID_SIZE, SURFACE_Y, DEFAULT_SIM_SPEED } from "../config"

export const getDynamicFootprint = (anchorId: number, gridSize: number, sizeX: number, sizeZ: number, rotStep: number) => {
    const row = Math.floor(anchorId / gridSize);
    const col = anchorId % gridSize;
    const footprint = [];
    const actualSizeX = (rotStep % 2 !== 0) ? sizeZ : sizeX;
    const actualSizeZ = (rotStep % 2 !== 0) ? sizeX : sizeZ;
    
    if (row + actualSizeX > gridSize || col + actualSizeZ > gridSize) return []; 
    
    for (let r = 0; r < actualSizeX; r++) {
        for (let c = 0; c < actualSizeZ; c++) {
            footprint.push((row + r) * gridSize + (col + c));
        }
    }
    return footprint;
}

export const isNodeEmpty = (status: number) => [0, 4, 5].includes(status);

export const getAnchorFromId = (id: number, nodesArr: number[], rots: Record<number, number>, gridSize: number) => {
    if (nodesArr[id] >= 7) return id;
    if (nodesArr[id] === 3) {
        for (let pAnchor = 0; pAnchor < nodesArr.length; pAnchor++) {
            if (nodesArr[pAnchor] >= 7) {
                const bld = Object.values(BUILDINGS).find(b => b.id === nodesArr[pAnchor]);
                if (bld) {
                    const fp = getDynamicFootprint(pAnchor, gridSize, bld.sizeX, bld.sizeZ, rots[pAnchor] || 0);
                    if (fp.includes(id)) return pAnchor;
                }
            }
        }
    }
    return -1;
}