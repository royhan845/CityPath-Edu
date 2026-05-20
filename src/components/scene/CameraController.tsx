"use client"

import { MapControls, OrbitControls } from "@react-three/drei"

export default function CameraController({ isMobile }: { isMobile: boolean }) {
    // Kalau di HP, pakai Orbit biasa supaya gampang di-rotate pakai 1 jari.
    // Kalau di PC, pakai MapControls supaya bisa di-pan (geser) pakai klik kanan layaknya game strategi.
    
    if (isMobile) {
        return (
            <OrbitControls 
                makeDefault 
                minDistance={10} 
                maxDistance={70} 
                maxPolarAngle={Math.PI / 2.1} 
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