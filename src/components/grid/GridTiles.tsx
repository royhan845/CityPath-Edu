"use client"

import { useMemo, useRef, useEffect } from "react"
import * as THREE from "three"
import { BUILDINGS, GRID_SIZE, SURFACE_Y, GRID_HEIGHT } from "../../config"
import { getDynamicFootprint, isNodeEmpty } from "../../utils/grid"

interface GridTilesProps {
    nodes: number[];
    nodeRotations: Record<number, number>;
    isAnimating: boolean;
    visNodes: number[];
    pathNodes: number[];
    animStep: number;
    activeNode: number | null;
    hoveredNode: number | null;
    selectedNodeId: number | null;
    drawMode: string;
    rotationStep: number;
    hasShownPopup: boolean;
    onPointerDown: (e: any) => void;
    onPointerMove: (id: number) => void;
    onPointerOut: () => void;
}

export default function GridTiles({
    nodes, nodeRotations, isAnimating, visNodes, pathNodes, animStep, activeNode,
    hoveredNode, selectedNodeId, drawMode, rotationStep, hasShownPopup,
    onPointerDown, onPointerMove, onPointerOut
}: GridTilesProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null!)
    const tempObject = useMemo(() => new THREE.Object3D(), []);
    const tempColor = useMemo(() => new THREE.Color(), []);

    // 1. SET MATRIKS POSISI AWAL (Hanya jalan 1x saat mount)
    useEffect(() => {
        if (!meshRef.current) return;
        let i = 0;
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let z = 0; z < GRID_SIZE; z++) {
                tempObject.position.set(x - GRID_SIZE / 2, 0, z - GRID_SIZE / 2);
                tempObject.updateMatrix();
                meshRef.current.setMatrixAt(i++, tempObject.matrix);
            }
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        meshRef.current.computeBoundingSphere();
        meshRef.current.computeBoundingBox();
    }, [tempObject]);

    // 2. UPDATE WARNA GRID BERDASARKAN STATE
    useEffect(() => {
        if (!meshRef.current) return;
        let hoverFootprint: number[] = [];
        let isHoverValid = false;

        if (!isAnimating && hoveredNode !== null) {
            if (drawMode && BUILDINGS[drawMode]) {
                const bldConfig = BUILDINGS[drawMode];
                hoverFootprint = getDynamicFootprint(hoveredNode, GRID_SIZE, bldConfig.sizeX, bldConfig.sizeZ, rotationStep);
                isHoverValid = hoverFootprint.length === (bldConfig.sizeX * bldConfig.sizeZ) && hoverFootprint.every(idx => isNodeEmpty(nodes[idx]));
            }
            else if (drawMode === "select" && selectedNodeId !== null) {
                const bldId = nodes[selectedNodeId];
                const bldConfig = Object.values(BUILDINGS).find(b => b.id === bldId);
                if (bldConfig) {
                    hoverFootprint = getDynamicFootprint(hoveredNode, GRID_SIZE, bldConfig.sizeX, bldConfig.sizeZ, rotationStep);
                    const currentFp = getDynamicFootprint(selectedNodeId, GRID_SIZE, bldConfig.sizeX, bldConfig.sizeZ, nodeRotations[selectedNodeId] || 0);
                    isHoverValid = hoverFootprint.length === (bldConfig.sizeX * bldConfig.sizeZ) && hoverFootprint.every(idx => isNodeEmpty(nodes[idx]) || currentFp.includes(idx));
                }
            }
            else if (drawMode === "start" || drawMode === "end") {
                hoverFootprint = [hoveredNode];
                isHoverValid = isNodeEmpty(nodes[hoveredNode]);
            }
        }

        const getBaseColor = (status: number, id: number) => {
            if (id === selectedNodeId) return "#06b6d4";
            if (status === 1) return "#10b981";
            if (status === 2) return "#f43f5e";
            if (status === 3 || status >= 6) return "#0f172a";
            return "#1e293b";
        };

        for (let id = 0; id < GRID_SIZE * GRID_SIZE; id++) {
            let hexColor = getBaseColor(nodes[id], id);

            if ((isAnimating || hasShownPopup) && nodes[id] !== 1 && nodes[id] !== 2) {
                const vIdx = visNodes.indexOf(id);
                const pIdx = pathNodes.indexOf(id);
                if (animStep > visNodes.length && pIdx !== -1 && pIdx < (animStep - visNodes.length)) {
                    hexColor = "#facc15"; 
                } else if (vIdx !== -1 && vIdx < Math.min(animStep, visNodes.length)) {
                    hexColor = "#0891b2"; 
                }
            }

            if (id === activeNode) hexColor = "#ffffff";
            if (hoverFootprint.includes(id)) hexColor = isHoverValid ? "#34d399" : "#fda4af";
            
            tempColor.set(hexColor);
            meshRef.current.setColorAt(id, tempColor);
        }
        meshRef.current.instanceColor!.needsUpdate = true;
    }, [nodes, nodeRotations, isAnimating, visNodes, pathNodes, animStep, activeNode, hoveredNode, drawMode, rotationStep, selectedNodeId, hasShownPopup, tempColor]);

    return (
        <instancedMesh 
            ref={meshRef} 
            args={[null!, null!, GRID_SIZE * GRID_SIZE]} 
            onPointerDown={onPointerDown} 
            onPointerMove={(e) => { e.stopPropagation(); if (e.instanceId !== undefined) onPointerMove(e.instanceId); }} 
            onPointerOut={onPointerOut}
        >
            <boxGeometry args={[0.9, GRID_HEIGHT, 0.9]} />
            <meshStandardMaterial />
        </instancedMesh>
    );
}