"use client"

import ModelLoader from "../shared/ModelLoader"
import { BUILDINGS, GRID_SIZE, SURFACE_Y } from "../../config"

interface GhostPreviewProps {
    isAnimating: boolean;
    hoveredNode: number | null;
    drawMode: string;
    rotationStep: number;
    selectedNodeId: number | null;
    nodes: number[];
}

export default function GhostPreview({ isAnimating, hoveredNode, drawMode, rotationStep, selectedNodeId, nodes }: GhostPreviewProps) {
    if (isAnimating || hoveredNode === null || drawMode === "start" || drawMode === "end") return null; 

    // Jika sedang dalam mode select dan sudah menunjuk objek, 
    // kita tetap tampilkan ghost agar kamu tahu dia sedang dirotasi
    const row = Math.floor(hoveredNode / GRID_SIZE);
    const col = hoveredNode % GRID_SIZE;
    const posX = row - GRID_SIZE / 2;
    const posZ = col - GRID_SIZE / 2;

    let bldEntry = null;
    
    // Tentukan entry bangunan berdasarkan mode
    if (drawMode && BUILDINGS[drawMode]) {
        bldEntry = BUILDINGS[drawMode];
    } else if (drawMode === "select" && selectedNodeId !== null) {
        const bldId = nodes[selectedNodeId];
        bldEntry = Object.values(BUILDINGS).find(b => b.id === bldId);
        // Kalau kursor di atas gedung yang terpilih, kita jangan sembunyikan, 
        // tapi biarkan ghost muncul untuk memberi feedback rotasi
    }

    if (!bldEntry) return null;
    
    const rStep = rotationStep;
    const actualSizeX = (rStep % 2 !== 0) ? bldEntry.sizeZ : bldEntry.sizeX;
    const actualSizeZ = (rStep % 2 !== 0) ? bldEntry.sizeX : bldEntry.sizeZ;
    
    if (row + actualSizeX > GRID_SIZE || col + actualSizeZ > GRID_SIZE) return null;
    
    const centerX = posX + ((actualSizeX - 1) * 0.5);
    const centerZ = posZ + ((actualSizeZ - 1) * 0.5);

    return (
        <group position={[centerX, SURFACE_Y + 0.1, centerZ]} rotation={[0, rStep * (Math.PI / 2), 0]} raycast={() => null}>
            <group rotation={[0, bldEntry.rotation?.[1] || 0, 0]}>
                <ModelLoader 
                    modelPath={bldEntry.path} 
                    position={[bldEntry.offset[0], 0, bldEntry.offset[1]]} 
                    scale={bldEntry.scale} 
                    opacity={0.5} 
                />
            </group>
        </group>
    );
}