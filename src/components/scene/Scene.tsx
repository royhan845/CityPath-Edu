"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { Canvas } from "@react-three/fiber"

// Import UI Panels
import PlaybackControls from "../panels/PlaybackControls"
import EditorPanel from "../panels/EditorPanel"
import MetricsPanel from "../panels/MetricsPanel"
import PerformanceAnalyticsModal from "../panels/PerformanceAnalyticsModal"
import TutorialModal from "../panels/TutorialModal"

// Import Scene Components
import Lighting from "./Lighting"
import CameraController from "./CameraController"
import Environment from "./Environment"

// Import Core Grid
import PathfindingGrid from "../grid/Grid"
import { useSimulationStore } from "../../stores/useSimulationStore"

interface SceneProps {
    initialMode?: 'tutorial' | 'report';
}

export default function Scene({ initialMode = 'tutorial' }: SceneProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showTutorialModal, setShowTutorialModal] = useState(false);

    const { 
        setStats, addHistory, algorithm, setLiveText,
        history, globalHistory, setHistory, setGlobalHistory,
        restoredMapData
    } = useSimulationStore();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize(); 
        window.addEventListener("resize", handleResize); 
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (initialMode === 'report') {
            setShowReportModal(true);
        }
    }, [initialMode]);

    useEffect(() => {
        if (initialMode === 'report') {
            setShowReportModal(true);
        } else if (initialMode === 'tutorial') {
            // Cek apakah user sudah pernah melihat tutorial sebelumnya
            const hasSeenTutorial = localStorage.getItem('citypath_has_seen_tutorial');
            
            // Jika belum pernah melihat (user baru), munculkan popup
            if (!hasSeenTutorial) {
                const timer = setTimeout(() => {
                    setShowTutorialModal(true);
                    // Langsung catat ke memori agar besok-besok tidak muncul lagi
                    localStorage.setItem('citypath_has_seen_tutorial', 'true');
                }, 800);
                return () => clearTimeout(timer);
            }
        }
    }, [initialMode]);

    useEffect(() => {
        const sessionHist = sessionStorage.getItem('citypath_session_history');
        if (sessionHist) { try { setHistory(JSON.parse(sessionHist)); } catch (e) { } }
        
        const localHist = localStorage.getItem('citypath_global_history_v2'); 
        if (localHist) { try { setGlobalHistory(JSON.parse(localHist)); } catch (e) { } }
    }, [setHistory, setGlobalHistory]);

    useEffect(() => {
        sessionStorage.setItem('citypath_session_history', JSON.stringify(history));
        localStorage.setItem('citypath_global_history_v2', JSON.stringify(globalHistory));
    }, [history, globalHistory]);

    const handleAnimationFinish = useCallback((visited: number, path: number, time: number, currentGridData?: any) => {
        const currentAlgo = useSimulationStore.getState().algorithm;

        setStats({ visited, path, time });
        
        // Simpan mapData ke dalam riwayat!
        addHistory({ algo: currentAlgo, visited, path, time, mapData: currentGridData }); 
        
        useSimulationStore.getState().setHasNewReport(true);
        setLiveText("Simulasi selesai. Menyiapkan laporan analisis...");
        
        setTimeout(() => {
            setShowReportModal(true);
            setLiveText("Sistem Siap. Silakan pilih algoritma lain.");
        }, 1500);

    }, [setStats, addHistory, setLiveText]);

    return (
        <div className="relative h-[100dvh] w-full bg-[#050816] overflow-hidden font-sans text-slate-300 select-none">
            
            <EditorPanel isMobile={isMobile} onShowTutorial={() => setShowTutorialModal(true)} />
            
            <MetricsPanel isMobile={isMobile} onOpenReport={() => setShowReportModal(true)} />
            
            <PlaybackControls />

            {showTutorialModal && (
                <TutorialModal onClose={() => setShowTutorialModal(false)} />
            )}

            {showReportModal && (
                <PerformanceAnalyticsModal onClose={() => setShowReportModal(false)} />
            )}

            <Canvas dpr={[1, 1.5]} camera={{ position: isMobile ? [0, 15, 30] : [0, 18, 25], fov: isMobile ? 55 : 30 }}>
                <Lighting />
                <CameraController isMobile={isMobile} />
                <Environment />
                
                <Suspense fallback={null}>
                    <PathfindingGrid 
                        isMobile={isMobile} 
                        onFinishAnimation={handleAnimationFinish} 
                        restoredMapData={restoredMapData}
                    />
                </Suspense>
            </Canvas>
        </div>
    )
}