export const indexToCoord = (index: number, gridSize: number) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    return { 
        row, 
        col, 
        x: row - gridSize / 2, 
        z: col - gridSize / 2 
    };
};