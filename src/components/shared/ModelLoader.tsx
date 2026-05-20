"use client"

import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { useMemo } from "react"

interface ModelLoaderProps {
    modelPath: string;
    position?: [number, number, number];
    scale?: [number, number, number] | number;
    rotation?: [number, number, number];
    opacity?: number;
    isSelected?: boolean;
}

export default function ModelLoader({ 
    modelPath, 
    position = [0, 0, 0], 
    scale = 1, 
    rotation = [0, 0, 0], 
    opacity = 1, 
    isSelected = false 
}: ModelLoaderProps) {
    
    const { scene } = useGLTF(modelPath);

    const clonedScene = useMemo(() => {
        const clone = scene.clone();
        
        clone.traverse((child: any) => {
            if (child.isMesh) {
                child.material = child.material.clone();
                
                if (opacity < 1) {
                    // Mode Bayangan (Ghost Preview)
                    child.material.transparent = true;
                    child.material.opacity = opacity;
                    child.material.depthWrite = false; 
                } else if (isSelected) {
                    // Mode Dipilih (Highlight Hijau)
                    child.material.emissive = new THREE.Color("#10b981");
                    child.material.emissiveIntensity = 0.5;
                }
            }
        });
        
        return clone;
    }, [scene, opacity, isSelected]);

    return (
        <primitive 
            object={clonedScene} 
            position={position} 
            scale={scale} 
            rotation={rotation} 
        />
    );
}