"use client"

import { MapControls, OrbitControls } from "@react-three/drei"
import { useSimulationStore } from "../../stores/useSimulationStore"

export default function CameraController({ isMobile }: { isMobile: boolean }) {
    const { interactionMode } = useSimulationStore();
    
    if (isMobile) {
        return (
            <OrbitControls 
                makeDefault 
                minDistance={10}
                maxDistance={80}
                maxPolarAngle={Math.PI / 2.2} 
                minPolarAngle={Math.PI / 6} 
                enabled={interactionMode === 'camera'} 
            />
        );
    }

    return (
        <MapControls 
            makeDefault 
            minDistance={10} 
            maxDistance={70} 
            panSpeed={1.5} 
            maxPolarAngle={Math.PI / 2.2} 
        />
    );
}