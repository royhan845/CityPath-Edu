import { useEffect, useRef } from "react";
import { useSimulationStore } from "../stores/useSimulationStore";
import { BUILDINGS, GRID_SIZE } from "../config"
import { getDynamicFootprint, isNodeEmpty, getAnchorFromId } from "../utils/grid";
import { playSound } from "../utils/audio";

export function useGridInteraction(
    nodes: number[], 
    setNodes: (val: number[]) => void,
    nodeRotations: Record<number, number>, 
    setNodeRotations: (val: Record<number, number> | ((prev: Record<number, number>) => Record<number, number>)) => void,
    selectedNodeId: number | null, 
    setSelectedNodeId: (val: number | null) => void,
    isAnimating: boolean,
    onGridModified: () => void
) {
    const { drawMode, setDrawMode, rotationStep } = useSimulationStore();
    
    // Simpan nilai rotasi sebelumnya untuk mendeteksi perubahan tombol 'R'
    const prevRotRef = useRef(rotationStep);

    // ========================================================
    // EFFECT: LOGIKA ROTASI LANGSUNG SAAT TEKAN 'R'
    // ========================================================
    useEffect(() => {
        // Jangan muter kalau sedang animasi, drawMode bukan select, atau tidak ada yang dipilih
        if (selectedNodeId === null || isAnimating || drawMode !== "select") return;

        // Detect jika tombol 'R' ditekan (rotationStep berubah)
        if (rotationStep !== prevRotRef.current) {
            const nodeVal = nodes[selectedNodeId];

            // 1. JIKA YANG DIPILIH ADALAH KARAKTER (ID 1 atau 2)
            if (nodeVal === 1 || nodeVal === 2) {
                // UPDATE ROTASI LANGSUNG DI SINI! (Tanpa nunggu klik)
                setNodeRotations((prev: Record<number, number>) => ({ 
                    ...prev, 
                    [selectedNodeId]: rotationStep 
                }));
                // Flag modified biar path reset
                onGridModified();
            } 
            // 2. JIKA YANG DIPILIH ADALAH GEDUNG (>= 7)
            else if (nodeVal >= 7) {
                // Tidak ada update langsung di sini, biar GhostPreview (bayangan)
                // yang handle rotasi visual sampai user nge-klik konfirmasi.
            }
        }
        prevRotRef.current = rotationStep;
    }, [rotationStep, selectedNodeId, isAnimating, nodes, drawMode, setNodeRotations, onGridModified]);


    // ========================================================
    // LOGIKA KLIK & PENEMPATAN (handlePointerDown)
    // ========================================================
    const handlePointerDown = (e: any) => {
        if (isAnimating) return;
        e.stopPropagation();
        try { if (e.target && e.pointerId !== undefined) e.target.releasePointerCapture(e.pointerId); } catch (err) {}

        const id = e.instanceId;
        if (id === undefined) return;

        const newNodes = [...nodes];
        let isStateChanged = false;
        let newRotations = { ...nodeRotations };
        let isRotationsChanged = false;
        let newSelectedId = selectedNodeId;

        if (drawMode === "select") {
            if (selectedNodeId !== null) {
                const nodeVal = newNodes[selectedNodeId];
                
                // JIKA SEDANG MEMILIH KARAKTER (Klik ID lain untuk pindah, klik ID sama untuk tutup seleksi)
                if (nodeVal === 1 || nodeVal === 2) {
                    if (id === selectedNodeId) {
                        newSelectedId = null; // Tutup seleksi
                    } else if (isNodeEmpty(newNodes[id])) {
                        // PINDAH LOKASI KARAKTER (Bawa rotasi terakhir)
                        newNodes[selectedNodeId] = 0;
                        delete newRotations[selectedNodeId];
                        newNodes[id] = nodeVal;
                        newRotations[id] = nodeRotations[selectedNodeId]; // Pakai rotasi terakhir yang diset 'R'
                        newSelectedId = id;
                        isStateChanged = true; isRotationsChanged = true;
                    } else {
                        // PILIH OBJEK LAIN
                        const pAnchor = getAnchorFromId(id, newNodes, nodeRotations, GRID_SIZE);
                        if (pAnchor !== -1) newSelectedId = pAnchor;
                        else if (newNodes[id] === 1 || newNodes[id] === 2) newSelectedId = id;
                    }
                } 
                // JIKA SEDANG MEMILIH GEDUNG (Rotasi via GhostPreview)
                else {
                    const bldId = newNodes[selectedNodeId];
                    const bld = Object.values(BUILDINGS).find(b => b.id === bldId);
                    if (bld) {
                        const currentRot = nodeRotations[selectedNodeId] || 0;
                        const currentFp = getDynamicFootprint(selectedNodeId, GRID_SIZE, bld.sizeX, bld.sizeZ, currentRot);
                        
                        if (currentFp.includes(id)) {
                            // KLIK GEDUNG SENDIRI -> KONFIRMASI ROTASI DARI GHOST
                            const newFp = getDynamicFootprint(selectedNodeId, GRID_SIZE, bld.sizeX, bld.sizeZ, rotationStep);
                            
                            // Hapus tapak lama sementara untuk cek tabrakan
                            currentFp.forEach(idx => newNodes[idx] = 0);
                            const isAreaClear = newFp.length === (bld.sizeX * bld.sizeZ) && newFp.every(idx => isNodeEmpty(newNodes[idx]));
                            
                            if (isAreaClear) {
                                newFp.forEach(idx => newNodes[idx] = 3);
                                newNodes[selectedNodeId] = bld.id;
                                newRotations[selectedNodeId] = rotationStep; // Terapkan rotasi ghost ke asli
                                isStateChanged = true; isRotationsChanged = true;
                            } else {
                                // Batal muter (mentok)
                                currentFp.forEach(idx => newNodes[idx] = 3);
                                newNodes[selectedNodeId] = bld.id;
                            }
                            newSelectedId = null; // Tutup seleksi setelah konfirmasi
                        } else if ((newNodes[id] >= 7 || newNodes[id] === 3 || newNodes[id] === 1 || newNodes[id] === 2) && !currentFp.includes(id)) {
                            // PILIH OBJEK LAIN
                            const pAnchor = getAnchorFromId(id, newNodes, nodeRotations, GRID_SIZE);
                            if (pAnchor !== -1) newSelectedId = pAnchor;
                            else if (newNodes[id] === 1 || newNodes[id] === 2) newSelectedId = id; 
                        } else {
                            // KLIK KOSONG -> PINDAH GEDUNG (Pakai rotasi terakhir yang diset ghost)
                            currentFp.forEach(idx => newNodes[idx] = 0); 
                            const newFp = getDynamicFootprint(id, GRID_SIZE, bld.sizeX, bld.sizeZ, rotationStep);
                            const isAreaClear = newFp.length === (bld.sizeX * bld.sizeZ) && newFp.every(idx => isNodeEmpty(newNodes[idx]));
                            
                            if (isAreaClear) {
                                newFp.forEach(idx => newNodes[idx] = 3);
                                newNodes[id] = bld.id; 
                                delete newRotations[selectedNodeId];
                                newRotations[id] = rotationStep; // Pakai rotasi ghost
                                newSelectedId = id; 
                                isStateChanged = true; isRotationsChanged = true;
                            } else {
                                currentFp.forEach(idx => newNodes[idx] = 3);
                                newNodes[selectedNodeId] = bld.id;
                                newSelectedId = null; 
                            }
                        }
                    }
                }
            } else {
                // KLIK PERTAMA KALI UNTUK MEMILIH
                const pAnchor = getAnchorFromId(id, newNodes, nodeRotations, GRID_SIZE);
                if (pAnchor !== -1) newSelectedId = pAnchor;
                else if (newNodes[id] === 1 || newNodes[id] === 2) newSelectedId = id; 
            }
        } 
        // ... (sisanya sama untuk mode delete dan menaruh objek baru) ...
        else if (drawMode === "delete") {
            const anchorId = getAnchorFromId(id, newNodes, nodeRotations, GRID_SIZE);
            if (anchorId !== -1) {
                const bld = Object.values(BUILDINGS).find(b => b.id === newNodes[anchorId]);
                if (bld) {
                    const fp = getDynamicFootprint(anchorId, GRID_SIZE, bld.sizeX, bld.sizeZ, nodeRotations[anchorId] || 0);
                    fp.forEach(idx => newNodes[idx] = 0);
                    delete newRotations[anchorId];
                    isRotationsChanged = true; isStateChanged = true;
                    if (newSelectedId === anchorId) newSelectedId = null;
                }
            } else if (newNodes[id] === 6 || newNodes[id] === 3) {
                newNodes[id] = 0; isStateChanged = true;
                if (newSelectedId === id) newSelectedId = null;
            }
        }
        else if (drawMode && BUILDINGS[drawMode]) {
            const bldConfig = BUILDINGS[drawMode];
            const footprint = getDynamicFootprint(id, GRID_SIZE, bldConfig.sizeX, bldConfig.sizeZ, rotationStep);
            const isAreaClear = footprint.length === (bldConfig.sizeX * bldConfig.sizeZ) && footprint.every(idx => isNodeEmpty(newNodes[idx]));
            if (isAreaClear) {
                footprint.forEach(idx => newNodes[idx] = 3);
                newNodes[id] = bldConfig.id;
                newRotations[id] = rotationStep;
                isRotationsChanged = true; isStateChanged = true;
            }
        } 
        else if (drawMode === "start") {
            if (isNodeEmpty(newNodes[id])) {
                const oldStartIdx = newNodes.indexOf(1);
                if (oldStartIdx !== -1) { newNodes[oldStartIdx] = 0; delete newRotations[oldStartIdx]; }
                newNodes[id] = 1; 
                newRotations[id] = rotationStep;
                isStateChanged = true; isRotationsChanged = true;
                setDrawMode("select");
            }
        }
        else if (drawMode === "end") {
            if (isNodeEmpty(newNodes[id])) {
                const oldEndIdx = newNodes.indexOf(2);
                if (oldEndIdx !== -1) { newNodes[oldEndIdx] = 0; delete newRotations[oldEndIdx]; }
                newNodes[id] = 2; 
                newRotations[id] = rotationStep;
                isStateChanged = true; isRotationsChanged = true;
                setDrawMode("select");
            }
        }

        if (isStateChanged) {
            setNodes(newNodes);
            onGridModified(); 
            if (drawMode === "delete") playSound("/sounds/delete.mp3", 0.4);
            else if (drawMode && BUILDINGS[drawMode]) playSound("/sounds/place.mp3", 0.6);
        }

        if (isRotationsChanged) setNodeRotations(newRotations);
        if (newSelectedId !== selectedNodeId) setSelectedNodeId(newSelectedId);
    };

    return { handlePointerDown };
}