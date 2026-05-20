"use client"

import { useState, useEffect, useCallback } from "react"
import { useGLTF } from "@react-three/drei"

import GridTiles from "./GridTiles"
import Buildings from "./Buildings"
import GhostPreview from "./GhostPreview"

import { BUILDINGS, GRID_SIZE, SURFACE_Y, DEFAULT_SIM_SPEED } from "../../config"
import { useSimulationStore } from "../../stores/useSimulationStore"
import { useGridInteraction } from "../../hooks/useGridInteraction" 
import { useSimulationPlayback } from "../../hooks/useSimulationPlayback"

// Preload assets agar tidak lag saat spawn
Object.values(BUILDINGS).forEach((bld) => useGLTF.preload(bld.path));
useGLTF.preload("/models/character/character-male-d.glb");
useGLTF.preload("/models/character/character-female-d.glb");

interface PathfindingGridProps {
    isMobile: boolean;
    restoredMapData?: any;
    onFinishAnimation: (visited: number, path: number, time: number, currentGridData?: any) => void;
}

export default function PathfindingGrid({ isMobile, restoredMapData, onFinishAnimation }: PathfindingGridProps) {
    const gridOffsetZ = isMobile ? -4 : 0;

    // 1. ZUSTAND GLOBAL STATE
    const { drawMode, rotationStep, setRotationStep, clearBoardTrigger, playbackStatus, templateId } = useSimulationStore();

    // 2. LOCAL STATE (Map Environment)
    const [nodes, setNodes] = useState<number[]>(() => {
        const initial = Array(GRID_SIZE * GRID_SIZE).fill(0);
        initial[1 * GRID_SIZE + 1] = 1; // Titik Awal
        initial[(GRID_SIZE - 2) * GRID_SIZE + (GRID_SIZE - 2)] = 2; // Titik Target
        return initial;
    });
    const [nodeRotations, setNodeRotations] = useState<Record<number, number>>({});
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

    // 3. LOGIC HOOKS
    const { 
        visNodes, pathNodes, animStep, isAnimating, activeNode, walkPath, isCharNear, setIsCharNear, hasShownPopup, resetPlaybackState 
    } = useSimulationPlayback(nodes, nodeRotations, GRID_SIZE, onFinishAnimation);

    const handleCharNear = useCallback(() => setIsCharNear(true), [setIsCharNear]);

    const { handlePointerDown } = useGridInteraction(
        nodes, setNodes, nodeRotations, setNodeRotations, 
        selectedNodeId, setSelectedNodeId, isAnimating, resetPlaybackState
    );

    // 4. EVENT LISTENERS
    useEffect(() => {
        if (restoredMapData && restoredMapData.nodes) {
            const cleanNodes = restoredMapData.nodes.map((n: number) => (n === 4 || n === 5) ? 0 : n);
            setNodes(cleanNodes);
            setNodeRotations(restoredMapData.nodeRotations || {});
        }
    }, [restoredMapData]);

    useEffect(() => {
        if (clearBoardTrigger > 0) {
            setNodes(() => {
                const emptyCity = Array(GRID_SIZE * GRID_SIZE).fill(0);
                emptyCity[1 * GRID_SIZE + 1] = 1; 
                emptyCity[(GRID_SIZE - 2) * GRID_SIZE + (GRID_SIZE - 2)] = 2;
                return emptyCity;
            });
            setNodeRotations({}); setSelectedNodeId(null);
        }
    }, [clearBoardTrigger]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r') {
                setRotationStep((prev: number) => (prev + 1) % 4);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setRotationStep]);

    // ===============================================
    // SIHIR ARSITEK V6 (EXTREME SCENARIOS & DYNAMIC CHARACTERS)
    // ===============================================
    useEffect(() => {
        setNodes((prev) => {
            const initial = Array(GRID_SIZE * GRID_SIZE).fill(0);
            const rots: Record<number, number> = {};
            
            // 1. TENTUKAN POSISI KARAKTER (Berdasarkan Skenario)
            let sRow = 1, sCol = 1, sRot = 1; // Cowok (Start)
            let eRow = 18, eCol = 18, eRot = 3; // Cewek (Target)

            if (templateId === 'maze') {
                // Cowok di ujung luar, Cewek terjebak di inti benteng
                sRow = 0; sCol = 0; sRot = 1; 
                eRow = 9; eCol = 9; eRot = 2; 
            } 
            else if (templateId === 'urban') {
                // Di ujung kota yang berlawanan secara diagonal
                sRow = 1; sCol = 1; sRot = 1; 
                eRow = 18; eCol = 18; eRot = 3; 
            } 
            else if (templateId === 'industrial') {
                // Cowok di utara, Cewek di selatan. Harus melewati rute zig-zag!
                sRow = 1; sCol = 1; sRot = 2; 
                eRow = 18; eCol = 1; eRot = 0; 
            }

            const startIdx = sRow * GRID_SIZE + sCol; 
            const endIdx = eRow * GRID_SIZE + eCol; 
            initial[startIdx] = 1; 
            initial[endIdx] = 2; 
            rots[startIdx] = sRot;
            rots[endIdx] = eRot;

            if (templateId === 'empty') {
                setNodeRotations(rots);
                return initial;
            }

            // FUNGSI PENANAM: Tetap gunakan padding=0 agar bisa padat!
            const safePlace = (row: number, col: number, bldId: number, rStep: number, padding: number = 0) => {
                const bld = Object.values(BUILDINGS).find(b => b.id === bldId);
                if (!bld) return;
                
                const sizeX = (rStep % 2 !== 0) ? bld.sizeZ : bld.sizeX;
                const sizeZ = (rStep % 2 !== 0) ? bld.sizeX : bld.sizeZ;

                if (row + sizeX > GRID_SIZE || col + sizeZ > GRID_SIZE) return;

                // Anti-Tabrak Karakter & Gedung lain
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

            // ---------------------------------------------
            // TEMA 1: LABYRINTH (Benteng 3 Lapis Konsentris)
            // ---------------------------------------------
            if (templateId === 'maze') {
                // Ring 1 (Luar) - Celah di Kanan Atas
                for (let i = 2; i <= 17; i++) {
                    if (i < 14) safePlace(2, i, ran1x1(2,i), 0, 0); // Atas
                    if (i > 4) safePlace(i, 17, ran1x1(i,17), 0, 0); // Kanan
                    safePlace(17, i, ran1x1(17,i), 0, 0); // Bawah
                    safePlace(i, 2, ran1x1(i,2), 0, 0); // Kiri
                }
                // Ring 2 (Tengah) - Celah di Kiri Bawah
                for (let i = 5; i <= 14; i++) {
                    safePlace(5, i, ran1x1(5,i), 0, 0); // Atas
                    if (i < 12) safePlace(i, 14, ran1x1(i,14), 0, 0); // Kanan
                    if (i > 7) safePlace(14, i, ran1x1(14,i), 0, 0); // Bawah
                    safePlace(i, 5, ran1x1(i,5), 0, 0); // Kiri
                }
                // Ring 3 (Dalam) - Celah di Tengah Atas
                for (let i = 8; i <= 11; i++) {
                    if (i > 9) safePlace(8, i, ran1x1(8,i), 0, 0); // Atas
                    safePlace(i, 11, ran1x1(i,11), 0, 0); // Kanan
                    safePlace(11, i, ran1x1(11,i), 0, 0); // Bawah
                    safePlace(i, 8, ran1x1(i,8), 0, 0); // Kiri
                }
            } 
            // ---------------------------------------------
            // TEMA 2: DOWNTOWN (Distrik Catur / Grid Keras)
            // ---------------------------------------------
            else if (templateId === 'urban') {
                // Membuat 9 distrik padat 5x5, dipisahkan oleh jalanan 1-kotak
                for (let r = 1; r <= 18; r += 6) {
                    for (let c = 1; c <= 18; c += 6) {
                        // Di dalam tiap distrik, kita tanam gedung padat
                        safePlace(r, c, 14, 0, 0);             // Tangki/Gedung 2x2
                        safePlace(r+2, c, ran2x1(r,c), 0, 0);  // 2x1 Horizontal
                        safePlace(r, c+2, ran2x1(r,c), 1, 0);  // 1x2 Vertical
                        safePlace(r+2, c+2, ran1x1(r,c), 0, 0); // Sudut 1x1
                        safePlace(r+3, c+3, ran1x1(r,c), 1, 0); // Sudut 1x1
                    }
                }
            } 
            // ---------------------------------------------
            // TEMA 3: INDUSTRIAL ZONE (Rute Ular Zig-Zag)
            // ---------------------------------------------
            else if (templateId === 'industrial') {
                // Membangun barikade gudang yang memotong seluruh layar
                
                // Lapis 1: Rapat ke kiri, celah di kanan
                for (let c = 0; c <= 15; c += 2) safePlace(4, c, 12, 0, 0);
                
                // Lapis 2: Rapat ke kanan, celah di kiri
                for (let c = 4; c <= 19; c += 2) safePlace(8, c, 12, 0, 0);
                
                // Lapis 3: Rapat ke kiri, celah di kanan
                for (let c = 0; c <= 15; c += 2) safePlace(12, c, 12, 0, 0);
                
                // Lapis 4: Rapat ke kanan, celah di kiri
                for (let c = 4; c <= 19; c += 2) safePlace(16, c, 12, 0, 0);

                // Tambahkan hiasan industrial di area kosong
                safePlace(1, 10, 14, 0, 0);  // Tangki di atas
                safePlace(6, 2, 11, 0, 0);   // Cerobong
                safePlace(10, 16, 14, 0, 0); // Tangki
                safePlace(14, 4, 11, 0, 0);  // Cerobong
            }

            setNodeRotations(rots);
            return initial;
        });
        setSelectedNodeId(null);
    }, [templateId]);

    // 5. RENDER COMPOSED COMPONENTS
    return (
        <group position={[0, 0, gridOffsetZ]}>
            <GridTiles 
                nodes={nodes} nodeRotations={nodeRotations} isAnimating={isAnimating}
                visNodes={visNodes} pathNodes={pathNodes} animStep={animStep}
                activeNode={activeNode} hoveredNode={hoveredNode} selectedNodeId={selectedNodeId}
                drawMode={drawMode} rotationStep={rotationStep} hasShownPopup={hasShownPopup.current}
                onPointerDown={handlePointerDown} 
                onPointerMove={setHoveredNode} 
                onPointerOut={() => setHoveredNode(null)}
            />
            
            <Buildings 
                nodes={nodes} nodeRotations={nodeRotations} selectedNodeId={selectedNodeId}
                walkPath={walkPath} isCharNear={isCharNear} playbackStatus={playbackStatus}
                onNear={handleCharNear}
            />

            <GhostPreview 
                isAnimating={isAnimating} hoveredNode={hoveredNode} drawMode={drawMode} 
                rotationStep={rotationStep} selectedNodeId={selectedNodeId} nodes={nodes} 
            />
        </group>
    )
}