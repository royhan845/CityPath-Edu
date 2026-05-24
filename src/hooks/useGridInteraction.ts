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
    const { drawMode, setDrawMode, rotationStep, interactionMode } = useSimulationStore();
    const prevRotRef = useRef(rotationStep);

    useEffect(() => {
        if (selectedNodeId === null || isAnimating || drawMode !== "select") return;

        if (rotationStep !== prevRotRef.current) {
            const nodeVal = nodes[selectedNodeId];

            if (nodeVal === 1 || nodeVal === 2) {
                setNodeRotations((prev: Record<number, number>) => ({ 
                    ...prev, 
                    [selectedNodeId]: rotationStep 
                }));
                onGridModified();
            } 
            else if (nodeVal >= 7) {
            }
        }
        prevRotRef.current = rotationStep;
    }, [rotationStep, selectedNodeId, isAnimating, nodes, drawMode, setNodeRotations, onGridModified]);

    const handlePointerDown = (e: any) => {
        if (isAnimating) return;
        if (e.pointerType === 'touch' && interactionMode === 'camera') {
            return; 
        }
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
                
                if (nodeVal === 1 || nodeVal === 2) {
                    if (id === selectedNodeId) {
                        newSelectedId = null;
                    } else if (isNodeEmpty(newNodes[id])) {
                        newNodes[selectedNodeId] = 0;
                        delete newRotations[selectedNodeId];
                        newNodes[id] = nodeVal;
                        newRotations[id] = nodeRotations[selectedNodeId];
                        newSelectedId = id;
                        isStateChanged = true; isRotationsChanged = true;
                    } else {
                        const pAnchor = getAnchorFromId(id, newNodes, nodeRotations, GRID_SIZE);
                        if (pAnchor !== -1) newSelectedId = pAnchor;
                        else if (newNodes[id] === 1 || newNodes[id] === 2) newSelectedId = id;
                    }
                } 
                else {
                    const bldId = newNodes[selectedNodeId];
                    const bld = Object.values(BUILDINGS).find(b => b.id === bldId);
                    if (bld) {
                        const currentRot = nodeRotations[selectedNodeId] || 0;
                        const currentFp = getDynamicFootprint(selectedNodeId, GRID_SIZE, bld.sizeX, bld.sizeZ, currentRot);
                        
                        if (currentFp.includes(id)) {
                            const newFp = getDynamicFootprint(selectedNodeId, GRID_SIZE, bld.sizeX, bld.sizeZ, rotationStep);
                            
                            currentFp.forEach(idx => newNodes[idx] = 0);
                            const isAreaClear = newFp.length === (bld.sizeX * bld.sizeZ) && newFp.every(idx => isNodeEmpty(newNodes[idx]));
                            
                            if (isAreaClear) {
                                newFp.forEach(idx => newNodes[idx] = 3);
                                newNodes[selectedNodeId] = bld.id;
                                newRotations[selectedNodeId] = rotationStep;
                                isStateChanged = true; isRotationsChanged = true;
                            } else {
                                currentFp.forEach(idx => newNodes[idx] = 3);
                                newNodes[selectedNodeId] = bld.id;
                            }
                            newSelectedId = null;
                        } else if ((newNodes[id] >= 7 || newNodes[id] === 3 || newNodes[id] === 1 || newNodes[id] === 2) && !currentFp.includes(id)) {
                            // PILIH OBJEK LAIN
                            const pAnchor = getAnchorFromId(id, newNodes, nodeRotations, GRID_SIZE);
                            if (pAnchor !== -1) newSelectedId = pAnchor;
                            else if (newNodes[id] === 1 || newNodes[id] === 2) newSelectedId = id; 
                        } else {
                            currentFp.forEach(idx => newNodes[idx] = 0); 
                            const newFp = getDynamicFootprint(id, GRID_SIZE, bld.sizeX, bld.sizeZ, rotationStep);
                            const isAreaClear = newFp.length === (bld.sizeX * bld.sizeZ) && newFp.every(idx => isNodeEmpty(newNodes[idx]));
                            
                            if (isAreaClear) {
                                newFp.forEach(idx => newNodes[idx] = 3);
                                newNodes[id] = bld.id; 
                                delete newRotations[selectedNodeId];
                                newRotations[id] = rotationStep;
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
                const pAnchor = getAnchorFromId(id, newNodes, nodeRotations, GRID_SIZE);
                if (pAnchor !== -1) newSelectedId = pAnchor;
                else if (newNodes[id] === 1 || newNodes[id] === 2) newSelectedId = id; 
            }
        } 
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