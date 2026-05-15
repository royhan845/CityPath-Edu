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
    setDrawMode?: (mode: string) => void;
    rotationStep: number;
    isMobile: boolean;
    templateId?: string; 
    simSpeed?: number;
    restoredMapData?: any; // PROP BARU: Untuk menerima map dari Scene
    onFinishAnimation: (visited: number, path: number, time: number, currentGridData?: any) => void; // UPDATE: Terima param ke-4
    onStepUpdate?: (text: string) => void;
}

export default function PathfindingGrid({ 
    triggerRun, algorithm, clearPathTrigger, clearBoardTrigger, drawMode, setDrawMode, rotationStep, isMobile, templateId = 'empty', 
    simSpeed = 50,
    restoredMapData,
    onFinishAnimation, onStepUpdate
}: PathfindingGridProps) {

    const gridOffsetZ = isMobile ? -4 : 0;
    const meshRef = useRef<THREE.InstancedMesh>(null!)
    
    const generateTemplate = (template: string) => {
        const initial = Array(GRID_SIZE * GRID_SIZE).fill(0);
        const rots: Record<number, number> = {};

        const startIdx = 1 * GRID_SIZE + 1; 
        const endIdx = (GRID_SIZE - 2) * GRID_SIZE + (GRID_SIZE - 2); 

        if (template === 'empty') {
            initial[startIdx] = 1;
            initial[endIdx] = 2;
            return { initialNodes: initial, initialRots: rots };
        }

        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (template === 'small') {
                    if (row % 5 === 0 || col % 5 === 0) initial[row * GRID_SIZE + col] = -1;
                } else if (template === 'metro') {
                    if (row % 3 === 0 || col % 4 === 0) initial[row * GRID_SIZE + col] = -1;
                }
            }
        }

        if (template === 'maze') {
            for (let r = 2; r < GRID_SIZE - 2; r += 2) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (r % 4 === 2 && c > 1) initial[r * GRID_SIZE + c] = -2;
                    if (r % 4 === 0 && c < GRID_SIZE - 2) initial[r * GRID_SIZE + c] = -2;
                }
            }
        }

        const mid = Math.floor(GRID_SIZE / 2);
        for (let r = mid - 2; r <= mid + 2; r++) {
            for (let c = mid - 3; c <= mid + 3; c++) {
                if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) initial[r * GRID_SIZE + c] = -1; 
            }
        }

        const safeZone = [
            startIdx, startIdx+1, startIdx+GRID_SIZE, startIdx+GRID_SIZE+1,
            endIdx, endIdx-1, endIdx-GRID_SIZE, endIdx-GRID_SIZE-1
        ];
        safeZone.forEach(idx => { if(idx >= 0 && idx < initial.length) initial[idx] = -1; });

        const buildingsList = Object.values(BUILDINGS).filter(b => b.id >= 7);
        if (template === 'metro') buildingsList.reverse();

        if (buildingsList.length > 0) {
            for (let row = 0; row < GRID_SIZE; row++) {
                for (let col = 0; col < GRID_SIZE; col++) {
                    const idx = row * GRID_SIZE + col;
                    
                    if (initial[idx] === 0 || initial[idx] === -2) { 
                        let bld = buildingsList[(row * 7 + col) % buildingsList.length];
                        
                        if (template === 'maze') {
                            bld = buildingsList.find(b => b.sizeX === 1 && b.sizeZ === 1) || buildingsList[0];
                        }

                        const rStep = (row + col) % 4; 
                        const actualSizeX = (rStep % 2 !== 0) ? bld.sizeZ : bld.sizeX;
                        const actualSizeZ = (rStep % 2 !== 0) ? bld.sizeX : bld.sizeZ;

                        if (row + actualSizeX > GRID_SIZE || col + actualSizeZ > GRID_SIZE) continue;

                        let canPlace = true;
                        const fp = [];
                        for (let r = 0; r < actualSizeX; r++) {
                            for (let c = 0; c < actualSizeZ; c++) {
                                const checkIdx = (row + r) * GRID_SIZE + (col + c);
                                if (template === 'maze' && initial[checkIdx] !== -2 && initial[checkIdx] !== 0) canPlace = false;
                                else if (template !== 'maze' && initial[checkIdx] !== 0) canPlace = false;
                                
                                if (!canPlace) break;
                                fp.push(checkIdx);
                            }
                            if (!canPlace) break;
                        }

                        if (template === 'maze' && initial[idx] !== -2) canPlace = false;

                        if (canPlace) {
                            fp.forEach(i => initial[i] = 3);
                            initial[idx] = bld.id; 
                            rots[idx] = rStep; 
                        }
                    }
                }
            }
        }

        for (let i = 0; i < initial.length; i++) {
            if (initial[i] === -1 || initial[i] === -2) initial[i] = 0;
        }

        initial[startIdx] = 1; 
        initial[endIdx] = 2; 

        return { initialNodes: initial, initialRots: rots };
    };

    const [nodes, setNodes] = useState<number[]>(() => generateTemplate(templateId).initialNodes);
    const [nodeRotations, setNodeRotations] = useState<Record<number, number>>(() => generateTemplate(templateId).initialRots);

    useEffect(() => {
        setIsAnimating(false);
        hasShownPopup.current = false;
        setWalkPath([]);
        setIsCharNear(false);
        if (onStepUpdate) onStepUpdate(`Membangun: ${templateId}...`);
        
        const newCity = generateTemplate(templateId);
        setNodes(newCity.initialNodes);
        setNodeRotations(newCity.initialRots);
        setSelectedNodeId(null);
        
        if (onStepUpdate) setTimeout(() => onStepUpdate("Menunggu Instruksi..."), 1000);
    }, [templateId]);

    const [hoveredNode, setHoveredNode] = useState<number | null>(null)
    const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
    const [walkPath, setWalkPath] = useState<number[]>([]);
    
    const [isCharNear, setIsCharNear] = useState(false);
    const [lastStats, setLastStats] = useState({ visited: 0, path: 0, time: 0 });

    const prevRotRef = useRef(rotationStep);
    const hasShownPopup = useRef(false);

    const [isAnimating, setIsAnimating] = useState(false);
    const [activeNode, setActiveNode] = useState<number | null>(null);

    // KUNCI: Menangkap map dari Logbook (jika di-restore)
    useEffect(() => {
        if (restoredMapData && restoredMapData.nodes) {
            setNodes(restoredMapData.nodes);
            setNodeRotations(restoredMapData.nodeRotations || {});
        }
    }, [restoredMapData]);
    
    useEffect(() => {
        if (isCharNear && walkPath.length > 0 && !hasShownPopup.current) {
            hasShownPopup.current = true;
            setIsAnimating(false);
            setActiveNode(null);
            
            const timer = setTimeout(() => {
                if (onFinishAnimation) {
                    // UPDATE: Kirim state nodes dan nodeRotations untuk disimpan ke Logbook
                    onFinishAnimation(lastStats.visited, lastStats.path, lastStats.time, { nodes, nodeRotations });
                }
            }, 800); 
            return () => clearTimeout(timer);
        }
    }, [isCharNear, walkPath, lastStats, onFinishAnimation, nodes, nodeRotations]);

    useEffect(() => {
        if (selectedNodeId !== null && rotationStep !== prevRotRef.current && !isAnimating) {
            setNodes(prev => {
                const newNodes = [...prev];
                const bldId = newNodes[selectedNodeId];
                const bld = Object.values(BUILDINGS).find(b => b.id === bldId);
                
                if (bld) {
                    const currentBldRot = nodeRotations[selectedNodeId] || 0;
                    
                    const oldFp = getDynamicFootprint(selectedNodeId, GRID_SIZE, bld.sizeX, bld.sizeZ, currentBldRot);
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
    }, [rotationStep, selectedNodeId, isAnimating]);

    useEffect(() => { 
        if (clearPathTrigger) {
            hasShownPopup.current = false; 
            setIsAnimating(false);
            setActiveNode(null);
            setNodes((prev) => {
                return prev.map(n => (n === 4 || n === 5) ? 0 : n);
            });
            setWalkPath([]);
            setIsCharNear(false);
        }
    }, [clearPathTrigger]);
    
    useEffect(() => {
        if (clearBoardTrigger) {
            hasShownPopup.current = false;
            setIsAnimating(false);
            setActiveNode(null);
            
            setNodes(() => {
                const emptyCity = Array(GRID_SIZE * GRID_SIZE).fill(0);
                const defaultStart = 1 * GRID_SIZE + 1;
                const defaultEnd = (GRID_SIZE - 2) * GRID_SIZE + (GRID_SIZE - 2);
                emptyCity[defaultStart] = 1;
                emptyCity[defaultEnd] = 2;
                return emptyCity;
            });
            setNodeRotations({}); 
            setSelectedNodeId(null);
            setWalkPath([]);
            setIsCharNear(false);
        }
    }, [clearBoardTrigger]);

    useEffect(() => {
        if (triggerRun) {
            hasShownPopup.current = false; 
            setIsAnimating(true);
            
            setNodes((prev) => prev.map(n => (n === 4 || n === 5) ? 0 : n))
            setTimeout(() => {
                const startTime = performance.now();

                let result = { visitedNodesInOrder: [] as number[], shortestPath: [] as number[] };
                if (algorithm === "dijkstra") result = runDijkstra(nodes, GRID_SIZE)
                else if (algorithm === "astar") result = runAStar(nodes, GRID_SIZE)
                else if (algorithm === "bfs") result = runBFS(nodes, GRID_SIZE)
                else if (algorithm === "dfs") result = runDFS(nodes, GRID_SIZE)
                else if (algorithm === "greedy") result = runGreedyBFS(nodes, GRID_SIZE)

                const endTime = performance.now();
                const execTime = endTime - startTime;

                animateAlgorithm(result.visitedNodesInOrder, result.shortestPath, execTime);
            }, 100);
        }
    }, [triggerRun, algorithm]);

    const animateAlgorithm = (visitedNodes: number[], pathNodes: number[], execTime: number) => {
        setWalkPath([]);
        setIsCharNear(false);
        setLastStats({ visited: visitedNodes.length, path: pathNodes.length, time: execTime });
        
        const PHASE_GAP = 400; 
        const SCAN_SPEED = simSpeed; 
        const PATH_SPEED = Math.max(10, simSpeed * 0.7); 

        if (onStepUpdate) onStepUpdate("Sistem Aktif: Memulai kalkulasi spasial...");

        for (let i = 0; i < visitedNodes.length; i++) {
            setTimeout(() => {
                const currentNode = visitedNodes[i];
                const x = Math.floor(currentNode / GRID_SIZE);
                const z = currentNode % GRID_SIZE;

                setActiveNode(currentNode);

                setNodes((prev) => { 
                    const n = [...prev]; 
                    if (n[currentNode] !== 1 && n[currentNode] !== 2) n[currentNode] = 4;
                    return n;
                });
                
                if (onStepUpdate && i % Math.max(1, Math.floor(200 / SCAN_SPEED)) === 0) {
                    onStepUpdate(`Proses: Evaluasi Node [${x}, ${z}]`);
                }
            }, SCAN_SPEED * i);
        }

        const timeToFinishScan = visitedNodes.length * SCAN_SPEED;
        const startTimePath = timeToFinishScan + PHASE_GAP;

        for (let i = 0; i < pathNodes.length; i++) {
            setTimeout(() => {
                const currentNode = pathNodes[i];
                setActiveNode(null);

                setNodes((prev) => { 
                    const n = [...prev]; 
                    if (n[currentNode] !== 1 && n[currentNode] !== 2) n[currentNode] = 5; 
                    return n; 
                });
            }, startTimePath + (PATH_SPEED * i));
        }

        const timeToFinishPath = startTimePath + (pathNodes.length * PATH_SPEED);
        const startTimeCharacter = timeToFinishPath + PHASE_GAP;

        setTimeout(() => {
            if (pathNodes.length > 0) {
                if (onStepUpdate) onStepUpdate("Jalur Ditemukan: Eksekusi navigasi target...");
                setWalkPath(pathNodes);
            } else {
                if (onStepUpdate) onStepUpdate("⚠️ Error: Jalur terblokir (Unreachable).");
                setActiveNode(null);
                // UPDATE: Kirim state juga kalau error
                if (onFinishAnimation) onFinishAnimation(visitedNodes.length, 0, execTime, { nodes, nodeRotations });
            }
        }, startTimeCharacter);
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
        if (status === 1) return "#10b981" 
        if (status === 2) return "#f43f5e" 
        if (status === 3 || status >= 6) return "#0f172a" 
        if (status === 4) return "#0891b2" 
        if (status === 5) return "#10b981" 
        
        return "#1e293b" 
    }

    const tempObject = new THREE.Object3D()
    const tempColor = new THREE.Color()

    useFrame(() => {
        let hoverFootprint: number[] = [];
        let isHoverValid = false;

        if (!isAnimating) {
            if (drawMode && BUILDINGS[drawMode] && hoveredNode !== null) {
                const bldConfig = BUILDINGS[drawMode];
                hoverFootprint = getDynamicFootprint(hoveredNode, GRID_SIZE, bldConfig.sizeX, bldConfig.sizeZ, rotationStep);
                isHoverValid = hoverFootprint.length === (bldConfig.sizeX * bldConfig.sizeZ) && hoverFootprint.every(idx => isNodeEmpty(nodes[idx]));
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
        }

        let i = 0
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let z = 0; z < GRID_SIZE; z++) {
                const id = i++
                tempObject.position.set(x - GRID_SIZE / 2, 0, z - GRID_SIZE / 2)
                tempObject.updateMatrix()
                meshRef.current.setMatrixAt(id, tempObject.matrix)

                let hexColor = getColor(nodes[id], id);

                if (id === activeNode) {
                    hexColor = "#ffffff";
                }

                if (hoverFootprint.includes(id)) {
                    hexColor = isHoverValid ? "#34d399" : "#fda4af";
                }
                tempColor.set(hexColor)
                meshRef.current.setColorAt(id, tempColor)
            }
        }
        meshRef.current.instanceMatrix.needsUpdate = true
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
    })

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
            else if (newNodes[id] === 6 || newNodes[id] === 3) {
                newNodes[id] = 0;
                isStateChanged = true;
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
                if (oldStartIdx !== -1) newNodes[oldStartIdx] = 0;
                newNodes[id] = 1;
                isStateChanged = true;

                newNodes.forEach((n, i) => { if (n === 4 || n === 5) newNodes[i] = 0; });
                setWalkPath([]); setIsCharNear(false);
                if (setDrawMode) setDrawMode("select");
            }
        }
        else if (drawMode === "end") {
            if (isNodeEmpty(newNodes[id])) {
                const oldEndIdx = newNodes.indexOf(2);
                if (oldEndIdx !== -1) newNodes[oldEndIdx] = 0;
                newNodes[id] = 2;
                isStateChanged = true;

                newNodes.forEach((n, i) => { if (n === 4 || n === 5) newNodes[i] = 0; });
                setWalkPath([]); setIsCharNear(false);
                if (setDrawMode) setDrawMode("select");
            }
        }

        if (isStateChanged) {
            setNodes(newNodes);
            if (drawMode === "delete") playSound("/sounds/delete.mp3", 0.4);
            else if (drawMode && BUILDINGS[drawMode]) playSound("/sounds/place.mp3", 0.6);
        }

        if (isRotationsChanged) setNodeRotations(newRotations);
        if (newSelectedId !== selectedNodeId) setSelectedNodeId(newSelectedId);
    }

    const renderGhost = () => {
        if (isAnimating || hoveredNode === null) return null; 

        const row = Math.floor(hoveredNode / GRID_SIZE);
        const col = hoveredNode % GRID_SIZE;
        const posX = row - GRID_SIZE / 2;
        const posZ = col - GRID_SIZE / 2;

        if (drawMode === "start") {
            return (
                <group position={[posX, SURFACE_Y, posZ]} rotation={[0, rotationStep * (Math.PI / 2), 0]}>
                    <ModelLoader 
                        modelPath="/models/character/character-male-d.glb"
                        position={[0, 0.15, 0]} 
                        scale={[0.5, 0.5, 0.5]} 
                        opacity={0.4} 
                    />
                </group>
            );
        }

        if (drawMode === "end") {
            return (
                <group position={[posX, SURFACE_Y, posZ]} rotation={[0, rotationStep * (Math.PI / 2), 0]}>
                    <ModelLoader 
                        modelPath="/models/character/character-female-d.glb"
                        position={[0, 0.15, 0]} 
                        scale={[0.5, 0.5, 0.5]} 
                        opacity={0.4} 
                    />
                </group>
            );
        }

        let bldEntry = null;
        if (drawMode && BUILDINGS[drawMode]) {
            bldEntry = BUILDINGS[drawMode];
        } else if (drawMode === "select" && selectedNodeId !== null) {
            const bldId = nodes[selectedNodeId];
            bldEntry = Object.values(BUILDINGS).find(b => b.id === bldId);
            if (hoveredNode === selectedNodeId) return null; 
        }

        if (!bldEntry) return null;

        const rStep = rotationStep;
        const actualSizeX = (rStep % 2 !== 0) ? bldEntry.sizeZ : bldEntry.sizeX;
        const actualSizeZ = (rStep % 2 !== 0) ? bldEntry.sizeX : bldEntry.sizeZ;

        if (row + actualSizeX > GRID_SIZE || col + actualSizeZ > GRID_SIZE) return null;

        const centerX = posX + ((actualSizeX - 1) * 0.5);
        const centerZ = posZ + ((actualSizeZ - 1) * 0.5);

        return (
            <group position={[centerX, SURFACE_Y + 0.1, centerZ]} rotation={[0, rStep * (Math.PI / 2), 0]}>
                <group rotation={[0, bldEntry.rotation?.[1] || 0, 0]}>
                    <ModelLoader 
                        modelPath={bldEntry.path}
                        position={[bldEntry.offset[0], 0, bldEntry.offset[1]]} 
                        scale={bldEntry.scale}
                        opacity={0.4}
                    />
                </group>
            </group>
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

                        const centerX = posX + ((actualSizeX - 1) * 0.5);
                        const centerZ = posZ + ((actualSizeZ - 1) * 0.5);

                        modelsToRender.push(
                            <group key={`bld-${id}`} position={[centerX, yPos, centerZ]} rotation={[0, rStep * (Math.PI / 2), 0]}>
                                <group rotation={[0, bldEntry.rotation?.[1] || 0, 0]}>
                                    <ModelLoader 
                                        modelPath={bldEntry.path}
                                        position={[bldEntry.offset[0], 0, bldEntry.offset[1]]} 
                                        scale={bldEntry.scale} 
                                        isSelected={id === selectedNodeId}
                                    />
                                </group>
                            </group>
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