"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

import ModelLoader from "./ModelLoader"
import AnimatedCharStart from "./AnimatedCharStart"
import AnimatedCharEnd from "./AnimatedCharEnd"
import { runDijkstra, runAStar, runBFS, runDFS, runGreedyBFS } from "../utils/algorithms"
import { playSound } from "../utils/audio"
import { BUILDINGS, GRID_SIZE, GRID_HEIGHT, SURFACE_Y } from "../config/constants"

Object.values(BUILDINGS).forEach((bld) => useGLTF.preload(bld.path));
useGLTF.preload("/models/character/character-male-d.glb");
useGLTF.preload("/models/character/character-female-d.glb");

const getDynamicFootprint = (anchorId: number, gridSize: number, sizeX: number, sizeZ: number, rotStep: number) => {
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

const isNodeEmpty = (status: number) => [0, 4, 5].includes(status);

interface PathfindingGridProps {
    triggerRun: boolean; 
    algorithm: string; 
    clearPathTrigger: boolean; 
    clearBoardTrigger: boolean;
    drawMode?: string; 
    rotationStep: number;
    isMobile: boolean;
}

export default function PathfindingGrid({ 
    triggerRun, algorithm, clearPathTrigger, clearBoardTrigger, drawMode, rotationStep, isMobile
}: PathfindingGridProps) {

    const gridOffsetZ = isMobile ? -4 : 0;
    const meshRef = useRef<THREE.InstancedMesh>(null!)
    const [nodes, setNodes] = useState(() => {
        const initial = Array(GRID_SIZE * GRID_SIZE).fill(0)
        initial[0] = 1; initial[GRID_SIZE * GRID_SIZE - 1] = 2; return initial;
    });

    const [hoveredNode, setHoveredNode] = useState<number | null>(null)
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
    const [nodeRotations, setNodeRotations] = useState<Record<number, number>>({});
    const [walkPath, setWalkPath] = useState<number[]>([]);
    const [isCharNear, setIsCharNear] = useState(false);

    const prevRotRef = useRef(rotationStep);
    
    useEffect(() => {
        if (selectedNodeId !== null && rotationStep !== prevRotRef.current) {
            setNodes(prev => {
                const newNodes = [...prev];
                const bldId = newNodes[selectedNodeId];
                const bld = Object.values(BUILDINGS).find(b => b.id === bldId);
                
                if (bld) {
                    const oldFp = getDynamicFootprint(selectedNodeId, GRID_SIZE, bld.sizeX, bld.sizeZ, prevRotRef.current);
                    oldFp.forEach(idx => newNodes[idx] = 0); 

                    const newFp = getDynamicFootprint(selectedNodeId, GRID_SIZE, bld.sizeX, bld.sizeZ, rotationStep);
                    const isAreaClear = newFp.length === (bld.sizeX * bld.sizeZ) && newFp.every(idx => isNodeEmpty(newNodes[idx]));

                    if (isAreaClear) {
                        newFp.forEach(idx => newNodes[idx] = 3);
                        newNodes[selectedNodeId] = bld.id;
                        setNodeRotations(r => ({ ...r, [selectedNodeId]: rotationStep }));
                    } else {
                        oldFp.forEach(idx => newNodes[idx] = 3);
                        newNodes[selectedNodeId] = bld.id;
                    }
                }
                return newNodes;
            });
        }
        prevRotRef.current = rotationStep;
    }, [rotationStep, selectedNodeId]);

    useEffect(() => { if (clearPathTrigger) setNodes((prev) => prev.map(n => (n === 4 || n === 5) ? 0 : n)); }, [clearPathTrigger]);
    
    useEffect(() => {
        if (clearBoardTrigger) {
            setNodes((prev) => prev.map(n => (n === 1 || n === 2) ? n : 0));
            setNodeRotations({}); setSelectedNodeId(null);
        }
    }, [clearBoardTrigger]);

    useEffect(() => {
        if (triggerRun) {
            setNodes((prev) => prev.map(n => (n === 4 || n === 5) ? 0 : n))
            setTimeout(() => {
                let result = { visitedNodesInOrder: [] as number[], shortestPath: [] as number[] };
                if (algorithm === "dijkstra") result = runDijkstra(nodes, GRID_SIZE)
                else if (algorithm === "astar") result = runAStar(nodes, GRID_SIZE)
                else if (algorithm === "bfs") result = runBFS(nodes, GRID_SIZE)
                else if (algorithm === "dfs") result = runDFS(nodes, GRID_SIZE)
                else if (algorithm === "greedy") result = runGreedyBFS(nodes, GRID_SIZE)
                animateAlgorithm(result.visitedNodesInOrder, result.shortestPath);
            }, 100);
        }
    }, [triggerRun, algorithm]);

    const animateAlgorithm = (visitedNodes: number[], pathNodes: number[]) => {
        setWalkPath([]);
        setIsCharNear(false);

        for (let i = 0; i < visitedNodes.length; i++) {
            setTimeout(() => setNodes((prev) => { 
                const n = [...prev]; 
                if (n[visitedNodes[i]] !== 1 && n[visitedNodes[i]] !== 2) n[visitedNodes[i]] = 4;
                return n;
            }), 15 * i);
        }

        const timeToFinishScan = visitedNodes.length * 15;

        for (let i = 0; i < pathNodes.length; i++) {
            setTimeout(() => setNodes((prev) => { 
                const n = [...prev]; 
                if (n[pathNodes[i]] !== 1 && n[pathNodes[i]] !== 2) n[pathNodes[i]] = 5; 
                return n; 
            }), timeToFinishScan + (50 * i));
        }

        setTimeout(() => setWalkPath(pathNodes), timeToFinishScan + (50 * pathNodes.length));
    };

    const getAnchorFromId = (id: number, nodesArr: number[], rots: Record<number, number>) => {
        if (nodesArr[id] >= 7) return id;
        if (nodesArr[id] === 3) {
            for (let pAnchor = 0; pAnchor < nodesArr.length; pAnchor++) {
                if (nodesArr[pAnchor] >= 7) {
                    const bld = Object.values(BUILDINGS).find(b => b.id === nodesArr[pAnchor]);
                    if (bld) {
                        const fp = getDynamicFootprint(pAnchor, GRID_SIZE, bld.sizeX, bld.sizeZ, rots[pAnchor] || 0);
                        if (fp.includes(id)) return pAnchor;
                    }
                }
            }
        }
        return -1;
    }

    const getColor = (status: number, id: number) => {
        if (id === selectedNodeId) return "#06b6d4" 
        if (status === 1) return "#22c55e" 
        if (status === 2) return "#ef4444" 
        if (status === 3 || status >= 6) return "#475569" 
        if (status === 4) return "#38bdf8" 
        if (status === 5) return "#facc15" 
        return "#ffffff" 
    }

    const tempObject = new THREE.Object3D()
    const tempColor = new THREE.Color()

    useFrame(() => {
        let hoverFootprint: number[] = [];
        let isHoverValid = false;

        if (drawMode?.startsWith("bld-") && hoveredNode !== null) {
            const bldConfig = BUILDINGS[drawMode];
            if (bldConfig) {
                hoverFootprint = getDynamicFootprint(hoveredNode, GRID_SIZE, bldConfig.sizeX, bldConfig.sizeZ, rotationStep);
                isHoverValid = hoverFootprint.length === (bldConfig.sizeX * bldConfig.sizeZ) && hoverFootprint.every(idx => isNodeEmpty(nodes[idx]));
            }
        }
        else if (drawMode === "select" && selectedNodeId !== null && hoveredNode !== null) {
            const bldId = nodes[selectedNodeId];
            const bldConfig = Object.values(BUILDINGS).find(b => b.id === bldId);
            if (bldConfig) {
                hoverFootprint = getDynamicFootprint(hoveredNode, GRID_SIZE, bldConfig.sizeX, bldConfig.sizeZ, rotationStep);
                const currentFp = getDynamicFootprint(selectedNodeId, GRID_SIZE, bldConfig.sizeX, bldConfig.sizeZ, nodeRotations[selectedNodeId] || 0);
                isHoverValid = hoverFootprint.length === (bldConfig.sizeX * bldConfig.sizeZ) && hoverFootprint.every(idx => isNodeEmpty(nodes[idx]) || currentFp.includes(idx));
            }
        }
        else if ((drawMode === "start" || drawMode === "end") && hoveredNode !== null) {
            hoverFootprint = [hoveredNode];
            isHoverValid = isNodeEmpty(nodes[hoveredNode]);
        }

        let i = 0
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let z = 0; z < GRID_SIZE; z++) {
                const id = i++
                tempObject.position.set(x - GRID_SIZE / 2, 0, z - GRID_SIZE / 2)
                tempObject.updateMatrix()
                meshRef.current.setMatrixAt(id, tempObject.matrix)

                let hexColor = getColor(nodes[id], id);
                if (hoverFootprint.includes(id)) {
                    hexColor = isHoverValid ? "#86efac" : "#fca5a5";
                }
                tempColor.set(hexColor)
                meshRef.current.setColorAt(id, tempColor)
            }
        }
        meshRef.current.instanceMatrix.needsUpdate = true
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
    })

    const handlePointerDown = (e: any) => {
        e.stopPropagation();

        try {
            if (e.target && e.pointerId !== undefined) {
                e.target.releasePointerCapture(e.pointerId);
            }
        } catch (err) {}

        const id = e.instanceId;
        if (id === undefined) return;

        const newNodes = [...nodes];
        let isStateChanged = false;
        let newRotations = { ...nodeRotations };
        let isRotationsChanged = false;
        let newSelectedId = selectedNodeId;

        if (drawMode === "select") {
            if (selectedNodeId !== null) {
                const bldId = newNodes[selectedNodeId];
                const bld = Object.values(BUILDINGS).find(b => b.id === bldId);

                if (bld) {
                    const currentFp = getDynamicFootprint(selectedNodeId, GRID_SIZE, bld.sizeX, bld.sizeZ, nodeRotations[selectedNodeId] || 0);

                    if (currentFp.includes(id)) {
                        newSelectedId = null;
                    } 
                    else if ((newNodes[id] >= 7 || newNodes[id] === 3) && !currentFp.includes(id)) {
                        const pAnchor = getAnchorFromId(id, newNodes, nodeRotations);
                        if (pAnchor !== -1) newSelectedId = pAnchor;
                    } 
                    else {
                        currentFp.forEach(idx => newNodes[idx] = 0); 
                        const newFp = getDynamicFootprint(id, GRID_SIZE, bld.sizeX, bld.sizeZ, rotationStep);
                        
                        const isAreaClear = newFp.length === (bld.sizeX * bld.sizeZ) && newFp.every(idx => isNodeEmpty(newNodes[idx]));

                        if (isAreaClear) {
                            newFp.forEach(idx => newNodes[idx] = 3);
                            newNodes[id] = bld.id; 
                            
                            delete newRotations[selectedNodeId];
                            newRotations[id] = rotationStep;
                            
                            newSelectedId = id; 
                            isStateChanged = true;
                            isRotationsChanged = true;
                        } else {
                            currentFp.forEach(idx => newNodes[idx] = 3);
                            newNodes[selectedNodeId] = bld.id;
                            newSelectedId = null; 
                        }
                    }
                }
            } else {
                const pAnchor = getAnchorFromId(id, newNodes, nodeRotations);
                if (pAnchor !== -1) newSelectedId = pAnchor;
            }
        } 
        else if (drawMode === "delete") {
            const anchorId = getAnchorFromId(id, newNodes, nodeRotations);
            if (anchorId !== -1) {
                const bld = Object.values(BUILDINGS).find(b => b.id === newNodes[anchorId]);
                if (bld) {
                    const fp = getDynamicFootprint(anchorId, GRID_SIZE, bld.sizeX, bld.sizeZ, nodeRotations[anchorId] || 0);
                    fp.forEach(idx => newNodes[idx] = 0);
                    delete newRotations[anchorId];
                    isRotationsChanged = true; isStateChanged = true;
                    if (newSelectedId === anchorId) newSelectedId = null;
                }
            }
        } 
        else if (drawMode?.startsWith("bld-")) {
            const bldConfig = BUILDINGS[drawMode];
            if (bldConfig) {
                const footprint = getDynamicFootprint(id, GRID_SIZE, bldConfig.sizeX, bldConfig.sizeZ, rotationStep);
                
                const isAreaClear = footprint.length === (bldConfig.sizeX * bldConfig.sizeZ) && footprint.every(idx => isNodeEmpty(newNodes[idx]));
                
                if (isAreaClear) {
                    footprint.forEach(idx => newNodes[idx] = 3);
                    newNodes[id] = bldConfig.id;
                    newRotations[id] = rotationStep;
                    isRotationsChanged = true; isStateChanged = true;
                }
            }
        } 
        else if (drawMode === "start") {
            if (isNodeEmpty(newNodes[id])) {
                const oldStartIdx = newNodes.indexOf(1);
                if (oldStartIdx !== -1) newNodes[oldStartIdx] = 0;
                newNodes[id] = 1;
                isStateChanged = true;

                newNodes.forEach((n, i) => {
                    if (n === 4 || n === 5) newNodes[i] = 0; 
                });
                setWalkPath([]);
                setIsCharNear(false);
            }
        }
        else if (drawMode === "end") {
            if (isNodeEmpty(newNodes[id])) {
                const oldEndIdx = newNodes.indexOf(2);
                if (oldEndIdx !== -1) newNodes[oldEndIdx] = 0;
                newNodes[id] = 2;
                isStateChanged = true;

                newNodes.forEach((n, i) => {
                    if (n === 4 || n === 5) newNodes[i] = 0; 
                });
                setWalkPath([]);
                setIsCharNear(false);
            }
        }

        if (isStateChanged) {
            setNodes(newNodes);
            if (drawMode === "delete") playSound("/sounds/delete.mp3", 0.4);
            else if (drawMode?.startsWith("bld-")) playSound("/sounds/place.mp3", 0.6);
        }

        if (isRotationsChanged) setNodeRotations(newRotations);
        if (newSelectedId !== selectedNodeId) setSelectedNodeId(newSelectedId);
    }

    const renderGhost = () => {
        if (hoveredNode === null) return null; 

        let bldEntry = null;

        if (drawMode?.startsWith("bld-")) {
            bldEntry = BUILDINGS[drawMode];
        } 
        else if (drawMode === "select" && selectedNodeId !== null) {
            const bldId = nodes[selectedNodeId];
            bldEntry = Object.values(BUILDINGS).find(b => b.id === bldId);
            if (hoveredNode === selectedNodeId) return null; 
        }

        if (!bldEntry) return null;

        const rStep = rotationStep;
        const actualSizeX = (rStep % 2 !== 0) ? bldEntry.sizeZ : bldEntry.sizeX;
        const actualSizeZ = (rStep % 2 !== 0) ? bldEntry.sizeX : bldEntry.sizeZ;

        const row = Math.floor(hoveredNode / GRID_SIZE);
        const col = hoveredNode % GRID_SIZE;

        if (row + actualSizeX > GRID_SIZE || col + actualSizeZ > GRID_SIZE) return null;

        const posX = row - GRID_SIZE / 2;
        const posZ = col - GRID_SIZE / 2;

        const ox = bldEntry.offset[0];
        const oz = bldEntry.offset[1];
        const theta = rStep * (Math.PI / 2);
        const cosT = Math.round(Math.cos(theta));
        const sinT = Math.round(Math.sin(theta));
        
        const rotatedOffsetX = (ox * cosT) + (oz * sinT);
        const rotatedOffsetZ = (-ox * sinT) + (oz * cosT);

        const centerX = posX + ((actualSizeX - 1) * 0.5) + rotatedOffsetX;
        const centerZ = posZ + ((actualSizeZ - 1) * 0.5) + rotatedOffsetZ;
        const rotationValue = rStep * (Math.PI / 2);

        return (
            <ModelLoader 
                modelPath={bldEntry.path}
                position={[centerX, SURFACE_Y + 0.1, centerZ]} 
                scale={bldEntry.scale}
                rotation={[0, rotationValue + (bldEntry.rotation?.[1] || 0), 0]}
                opacity={0.4}
            />
        );
    };

    const renderModels = useMemo(() => {
        const modelsToRender = []
        let id = 0;
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let z = 0; z < GRID_SIZE; z++) {
                const status = nodes[id];
                const posX = x - GRID_SIZE / 2;
                const posZ = z - GRID_SIZE / 2;
                
                const rStep = nodeRotations[id] || 0;
                const yPos = (id === selectedNodeId) ? SURFACE_Y + 0.1 : SURFACE_Y;

                if (status === 1) {
                    modelsToRender.push(
                        <AnimatedCharStart 
                            key={`start-anim-${id}`} 
                            startNode={nodes.indexOf(1)}
                            path={walkPath}
                            rotStep={rStep}
                            onNear={() => setIsCharNear(true)} 
                        />
                    )
                } 
                else if (status === 2) {
                    modelsToRender.push(
                        <AnimatedCharEnd 
                            key={`end-anim-${id}`} 
                            id={id}
                            path={walkPath}
                            rotStep={rStep}
                            isCharNear={isCharNear} 
                        />
                    )
                }
                else if (status >= 7) {
                    const bldEntry = Object.values(BUILDINGS).find(b => b.id === status);
                    if (bldEntry) {
                        const actualSizeX = (rStep % 2 !== 0) ? bldEntry.sizeZ : bldEntry.sizeX;
                        const actualSizeZ = (rStep % 2 !== 0) ? bldEntry.sizeX : bldEntry.sizeZ;

                        const ox = bldEntry.offset[0];
                        const oz = bldEntry.offset[1];

                        const theta = rStep * (Math.PI / 2);
                        const cosT = Math.round(Math.cos(theta));
                        const sinT = Math.round(Math.sin(theta));

                        const rotatedOffsetX = (ox * cosT) + (oz * sinT);
                        const rotatedOffsetZ = (-ox * sinT) + (oz * cosT);

                        const centerX = posX + ((actualSizeX - 1) * 0.5) + rotatedOffsetX;
                        const centerZ = posZ + ((actualSizeZ - 1) * 0.5) + rotatedOffsetZ;
                        const rotationValue = rStep * (Math.PI / 2);

                        modelsToRender.push(
                            <ModelLoader 
                                key={`bld-${id}`} 
                                modelPath={bldEntry.path}
                                position={[centerX, yPos, centerZ]} 
                                scale={bldEntry.scale} 
                                rotation={[0, rotationValue + (bldEntry.rotation?.[1] || 0), 0]} 
                                isSelected={id === selectedNodeId}
                            />
                        )
                    }
                }
                id++;
            }
        }
        return modelsToRender
    }, [nodes, nodeRotations, selectedNodeId, walkPath, isCharNear]);

    return (
        <group position={[0, 0, gridOffsetZ]}>
            <instancedMesh 
                ref={meshRef} 
                args={[null!, null!, GRID_SIZE * GRID_SIZE]} 
                onPointerDown={handlePointerDown}
                onPointerMove={(e) => { e.stopPropagation(); if (e.instanceId !== undefined) setHoveredNode(e.instanceId); }}
                onPointerOut={() => setHoveredNode(null)}
            >
                <boxGeometry args={[0.9, GRID_HEIGHT, 0.9]} />
                <meshStandardMaterial />
            </instancedMesh>
            {renderModels}
            {renderGhost()}
        </group>
    )
}