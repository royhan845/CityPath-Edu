import { useState, useEffect, useRef, useCallback } from "react";
import { useSimulationStore } from "../stores/useSimulationStore";
import { AlgorithmType, PathfindingResult } from "../types/algorithm";

export function useSimulationPlayback(
    nodes: number[], 
    nodeRotations: Record<number, number>,
    GRID_SIZE: number, 
    onFinishAnimation: (visited: number, path: number, time: number, currentGridData?: any) => void
) {
    const [visNodes, setVisNodes] = useState<number[]>([]);
    const [pathNodes, setPathNodes] = useState<number[]>([]);
    const [animStep, setAnimStep] = useState(0);
    const [execStats, setExecStats] = useState({ time: 0 });
    const [isAnimating, setIsAnimating] = useState(false);
    const [activeNode, setActiveNode] = useState<number | null>(null);
    const [walkPath, setWalkPath] = useState<number[]>([]);
    const [isCharNear, setIsCharNear] = useState(false);

    const hasShownPopup = useRef(false);
    const workerRef = useRef<Worker | null>(null);
    const lastRunTrigger = useRef(0); 

    const {
        algorithm, simSpeed, playbackStatus, setPlaybackStatus, setLiveText,
        runTrigger, clearPathTrigger, clearBoardTrigger, stepForwardTrigger, stepBackwardTrigger, stopTrigger,
        setStats
    } = useSimulationStore();

    useEffect(() => {
        workerRef.current = new Worker(new URL('../workers/pathfinding.worker.ts', import.meta.url));
        return () => { workerRef.current?.terminate(); }
    }, []);

    const resetPlaybackState = useCallback(() => {
        setVisNodes([]); setPathNodes([]); setAnimStep(0); setWalkPath([]); setIsCharNear(false);
        setIsAnimating(false); setActiveNode(null); hasShownPopup.current = false;
        setStats(null); 
    }, [setStats]);

    // 1. EKSEKUSI
    useEffect(() => {
        if (runTrigger > lastRunTrigger.current && workerRef.current) {
            lastRunTrigger.current = runTrigger;
            resetPlaybackState();
            setLiveText("Memproses algoritma di background...");
            
            workerRef.current.onmessage = (e: MessageEvent<PathfindingResult>) => {
                if (e.data.error) {
                    setLiveText(`Error: ${e.data.error}`);
                    setPlaybackStatus('idle');
                    setIsAnimating(false);
                    return;
                }
                
                setExecStats({ time: e.data.executionTimeMs || 0 });
                setVisNodes(e.data.visitedNodesInOrder || []);
                setPathNodes(e.data.shortestPath || []);
                setIsAnimating(true);
            };

            workerRef.current.postMessage({
                algorithm: algorithm as AlgorithmType,
                nodes: [...nodes], 
                gridSize: GRID_SIZE
            });
        }
    }, [runTrigger, algorithm, nodes, GRID_SIZE, resetPlaybackState, setLiveText, setPlaybackStatus]);

    // 2. KONTROL MEDIA
    useEffect(() => { if (clearPathTrigger > 0) { resetPlaybackState(); setPlaybackStatus('idle'); } }, [clearPathTrigger, resetPlaybackState, setPlaybackStatus]);
    useEffect(() => { if (clearBoardTrigger > 0) { resetPlaybackState(); setPlaybackStatus('idle'); } }, [clearBoardTrigger, resetPlaybackState, setPlaybackStatus]);
    useEffect(() => { if (stepForwardTrigger > 0) setAnimStep(s => Math.min(s + 1, visNodes.length + pathNodes.length)); }, [stepForwardTrigger, visNodes.length, pathNodes.length]);
    useEffect(() => { if (stepBackwardTrigger > 0) setAnimStep(s => Math.max(s - 1, 0)); }, [stepBackwardTrigger]);
    useEffect(() => {
        if (stopTrigger > 0) {
            resetPlaybackState();
            setPlaybackStatus('idle');
            setLiveText("Eksekusi dibatalkan.");
        }
    }, [stopTrigger, resetPlaybackState, setPlaybackStatus, setLiveText]);

    // 3. ANIMATION LOOP & FIX KOORDINAT
    useEffect(() => {
        let timer: NodeJS.Timeout;
        const totalSteps = visNodes.length + pathNodes.length;
        const isPaused = playbackStatus === 'paused';

        if (isAnimating && totalSteps === 0 && !hasShownPopup.current && playbackStatus === 'playing') {
            setLiveText("⚠️ Rute terblokir total.");
            hasShownPopup.current = true; setIsAnimating(false); setPlaybackStatus('idle');
            onFinishAnimation(0, 0, execStats.time, { nodes, nodeRotations });
            return;
        }

        if (isAnimating && !isPaused && totalSteps > 0 && playbackStatus === 'playing') {
            if (animStep < totalSteps) {
                const isPathStep = animStep >= visNodes.length;
                const speed = isPathStep ? Math.max(10, simSpeed * 0.7) : simSpeed;

                if (isPathStep) {
                    setLiveText("Jalur Ditemukan: Menavigasi target...");
                } else if (animStep % Math.max(1, Math.floor(200 / speed)) === 0) {
                    const currentNode = visNodes[animStep];
                    if (currentNode !== undefined && currentNode !== null) {
                        setLiveText(`Mengevaluasi Node [${Math.floor(currentNode / GRID_SIZE)}, ${currentNode % GRID_SIZE}]`);
                    }
                }

                setActiveNode(isPathStep ? pathNodes[animStep - visNodes.length] : visNodes[animStep]);
                timer = setTimeout(() => setAnimStep(s => s + 1), speed);

            } else if (animStep >= totalSteps && !hasShownPopup.current) {
                setActiveNode(null);
                if (pathNodes.length > 0) {
                    setWalkPath(pathNodes);
                } else {
                    setLiveText("⚠️ Sistem Peringatan: Tidak ada jalur terbuka.");
                    hasShownPopup.current = true; setIsAnimating(false); setPlaybackStatus('idle');
                    onFinishAnimation(visNodes.length, 0, execStats.time, { nodes, nodeRotations });
                }
            }
        }
        return () => clearTimeout(timer);
    }, [isAnimating, playbackStatus, animStep, visNodes, pathNodes, simSpeed, execStats, GRID_SIZE, setLiveText, setPlaybackStatus, onFinishAnimation, nodes, nodeRotations]);

    // 4. TRIGGER CHARACTER SAMPAI (FIX TIMER MATI)
    useEffect(() => {
        if (isCharNear && walkPath.length > 0 && !hasShownPopup.current && playbackStatus === 'playing') {
            hasShownPopup.current = true; 
            setIsAnimating(false); 
            setActiveNode(null); 
            
            // KUNCI PERBAIKAN: setPlaybackStatus dipindah ke DALAM timeout
            // Ini mencegah React mematikan (cleanup) timeout secara paksa
            const timer = setTimeout(() => {
                setPlaybackStatus('idle');
                onFinishAnimation(visNodes.length, pathNodes.length, execStats.time, { nodes, nodeRotations });
            }, 800);
            
            return () => clearTimeout(timer);
        }
    }, [isCharNear, walkPath, execStats, visNodes, pathNodes, setPlaybackStatus, onFinishAnimation, nodes, nodeRotations, playbackStatus]);

    return {
        visNodes, pathNodes, animStep, isAnimating, activeNode, walkPath, isCharNear, setIsCharNear, hasShownPopup, resetPlaybackState
    };
}