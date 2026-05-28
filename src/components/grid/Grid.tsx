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
import { generateTemplateMap } from "../../utils/mapGenerators" 

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

    const { drawMode, rotationStep, setRotationStep, clearBoardTrigger, clearPathTrigger, playbackStatus, templateId } = useSimulationStore();

    const [nodes, setNodes] = useState<number[]>(() => {
        const initial = Array(GRID_SIZE * GRID_SIZE).fill(0);
        initial[1 * GRID_SIZE + 1] = 1; 
        initial[(GRID_SIZE - 2) * GRID_SIZE + (GRID_SIZE - 2)] = 2; 
        return initial;
    });
    const [nodeRotations, setNodeRotations] = useState<Record<number, number>>({});
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

    const { 
        visNodes, pathNodes, animStep, isAnimating, activeNode, walkPath, isCharNear, setIsCharNear, hasShownPopup, resetPlaybackState 
    } = useSimulationPlayback(nodes, nodeRotations, GRID_SIZE, onFinishAnimation);

    const handleCharNear = useCallback(() => setIsCharNear(true), [setIsCharNear]);

    const { handlePointerDown } = useGridInteraction(
        nodes, setNodes, nodeRotations, setNodeRotations, 
        selectedNodeId, setSelectedNodeId, isAnimating, resetPlaybackState
    );

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
        if (clearPathTrigger > 0) {
            resetPlaybackState();
        }
    }, [clearPathTrigger, resetPlaybackState]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r') setRotationStep((prev: number) => (prev + 1) % 4);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setRotationStep]);

    useEffect(() => {
        const { newNodes, newRotations } = generateTemplateMap(templateId);
        setNodes(newNodes);
        setNodeRotations(newRotations);
        setSelectedNodeId(null);
    }, [templateId]);

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