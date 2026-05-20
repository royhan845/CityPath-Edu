"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface SelectionOutlineProps {
    sizeX: number;
    sizeZ: number;
}

export default function SelectionOutline({ sizeX, sizeZ }: SelectionOutlineProps) {
    const groupRef = useRef<THREE.Group>(null!)

    // Animasi "Breathing" (membesar mengecil sedikit secara halus)
    useFrame((state) => {
        if (groupRef.current) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.02;
            groupRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group ref={groupRef}>
            <mesh position={[0, 0.4, 0]}>
                {/* Kotak outline sedikit lebih besar dari gedung aslinya */}
                <boxGeometry args={[sizeX + 0.05, 1, sizeZ + 0.05]} />
                <meshBasicMaterial 
                    color="#22D3EE" 
                    wireframe 
                    transparent 
                    opacity={0.4} 
                />
            </mesh>
            {/* Efek pendaran lampu di lantai */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[sizeX + 0.2, sizeZ + 0.2]} />
                <meshBasicMaterial 
                    color="#22D3EE" 
                    transparent 
                    opacity={0.1} 
                    depthWrite={false}
                />
            </mesh>
        </group>
    )
}