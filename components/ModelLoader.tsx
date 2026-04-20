"use client"

import { useGLTF, Clone } from "@react-three/drei"

interface ModelLoaderProps {
  modelPath: string;
  position: [number, number, number];
  scale?: [number, number, number] | number;
  rotation?: [number, number, number];
  isSelected?: boolean;
  opacity?: number;
}

export default function ModelLoader({ 
  modelPath, 
  position, 
  scale = 0.8, 
  rotation = [0, 0, 0], 
  isSelected = false,
  opacity = 1 
}: ModelLoaderProps) {
  const { scene } = useGLTF(modelPath)
  
  return (
    <group position={position} rotation={rotation}>
      {isSelected ? (
        // 1. Jika sedang dipilih (Klik), ubah jadi hologram warna Cyan
        <Clone 
          object={scene} 
          scale={scale} 
          inject={<meshStandardMaterial color="#06b6d4" transparent opacity={0.6} depthWrite={false} />}
        />
      ) : opacity < 1 ? (
        // 2. Jika opacity di bawah 1 (Mode Ghost Preview), jadikan transparan biasa
        <Clone 
          object={scene} 
          scale={scale} 
          inject={<meshStandardMaterial transparent opacity={opacity} depthWrite={false} />}
        />
      ) : (
        // 3. Jika normal, tampilkan model asli
        <Clone object={scene} scale={scale} />
      )}
    </group>
  )
}