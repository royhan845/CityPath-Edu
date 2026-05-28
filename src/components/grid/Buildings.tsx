"use client"

import { useMemo } from "react"
import ModelLoader from "../shared/ModelLoader"
import AnimatedCharStart from "../characters/AnimatedCharStart"
import AnimatedCharEnd from "../characters/AnimatedCharEnd"
import { BUILDINGS, GRID_SIZE, SURFACE_Y } from "../../config"
import { useSimulationStore } from "../../stores/useSimulationStore"

interface BuildingsProps {
    nodes: number[];
    nodeRotations: Record<number, number>;
    selectedNodeId: number | null;
    walkPath: number[];
    isCharNear: boolean;
    playbackStatus: 'idle' | 'playing' | 'paused';
    onNear: () => void;
}

export default function Buildings({
    nodes, nodeRotations, selectedNodeId, walkPath, isCharNear, playbackStatus, onNear
}: BuildingsProps) {
    
    const { skipTrigger } = useSimulationStore();

    const renderModels = useMemo(() => {
        const modelsToRender = []
        let id = 0;
        
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let z = 0; z < GRID_SIZE; z++) {
                const status = nodes[id];
                const posX = x - GRID_SIZE / 2; 
                const posZ = z - GRID_SIZE / 2;
                const rStep = nodeRotations[id] || 0;
                const yPos = (id === selectedNodeId) ? SURFACE_Y + 0.05 : SURFACE_Y;

                // 1. RENDER GEDUNG (ID >= 7)
                if (status >= 7) {
                    const bldEntry = Object.values(BUILDINGS).find(b => b.id === status);
                    if (bldEntry) {
                        const actualSizeX = (rStep % 2 !== 0) ? bldEntry.sizeZ : bldEntry.sizeX;
                        const actualSizeZ = (rStep % 2 !== 0) ? bldEntry.sizeX : bldEntry.sizeZ;
                        const centerX = posX + ((actualSizeX - 1) * 0.5);
                        const centerZ = posZ + ((actualSizeZ - 1) * 0.5);
                        
                        modelsToRender.push(
                            <group key={`bld-${id}`} position={[centerX, yPos, centerZ]} rotation={[0, rStep * (Math.PI / 2), 0]} raycast={() => null}>
                                <group rotation={[0, bldEntry.rotation?.[1] || 0, 0]}>
                                    <ModelLoader 
                                        modelPath={bldEntry.path} 
                                        position={[bldEntry.offset[0], 0, bldEntry.offset[1]]} 
                                        scale={bldEntry.scale} 
                                        isSelected={id === selectedNodeId} // Cukup kirim prop ini untuk highlight
                                    />
                                </group>
                            </group>
                        )
                    }
                }

                // 2. RENDER KARAKTER
                if (status === 1) {
                    modelsToRender.push(
                        <group key={`start-anim-${id}`} raycast={() => null}>
                            <AnimatedCharStart 
                                startNode={id} 
                                path={walkPath} 
                                rotStep={rStep} 
                                onNear={onNear} 
                                isPaused={playbackStatus === 'paused'} 
                                skipTrigger={skipTrigger}
                            />
                        </group>
                    )
                }
                else if (status === 2) {
                    modelsToRender.push(
                        <group key={`end-anim-${id}`} raycast={() => null}>
                            <AnimatedCharEnd id={id} path={walkPath} rotStep={rStep} isCharNear={isCharNear} />
                        </group>
                    )
                }
                
                id++;
            }
        }
        return modelsToRender
    }, [nodes, nodeRotations, selectedNodeId, walkPath, isCharNear, playbackStatus, onNear, skipTrigger]); 

    return <>{renderModels}</>;
}