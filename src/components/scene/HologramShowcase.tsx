"use client"
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Torus, Sphere, MeshDistortMaterial } from "@react-three/drei";

export default function HologramShowcase() {
    return (
        <Canvas camera={{ position: [3.5, 4.5, 3.5], fov: 42 }}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={2} color="#22D3EE" />
            <pointLight position={[-5, -5, -5]} intensity={1} color="#38BDF8" />
            
            <OrbitControls autoRotate autoRotateSpeed={1.5} enableZoom={false} enablePan={false} />
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <group position={[-1, -0.5, -1]}>
                    <Torus args={[2.8, 0.008, 16, 100]} rotation={[Math.PI/2, 0, 0]} position={[1, 0, 1]}>
                        <meshBasicMaterial color="#22D3EE" transparent opacity={0.3} wireframe />
                    </Torus>
                    <Torus args={[3.2, 0.015, 16, 100]} rotation={[Math.PI/2.1, Math.PI/12, 0]} position={[1, 0, 1]}>
                        <meshBasicMaterial color="#38BDF8" transparent opacity={0.1} />
                    </Torus>

                    <gridHelper args={[4, 10, "#1e293b", "#0f172a"]} position={[1, 0, 1]} />
                    
                    <mesh position={[1, 0.2, 0.5]}><boxGeometry args={[0.5, 0.4, 0.5]} /><meshStandardMaterial color="#0f172a" transparent opacity={0.8} wireframe /></mesh>
                    <mesh position={[2, 0.3, 1.5]}><boxGeometry args={[0.5, 0.6, 0.5]} /><meshStandardMaterial color="#0f172a" transparent opacity={0.8} wireframe /></mesh>
                    <mesh position={[0.5, 0.15, 2]}><boxGeometry args={[0.5, 0.3, 0.5]} /><meshStandardMaterial color="#0f172a" transparent opacity={0.8} wireframe /></mesh>

                    {[[0,0], [0,1], [1,1], [1,2], [2,2], [3,2], [3,3]].map((p, i) => (
                        <mesh key={i} position={[p[0] * 0.4 + 0.4, 0.05, p[1] * 0.4 + 0.4]}>
                            <sphereGeometry args={[0.04, 16, 16]} />
                            <meshStandardMaterial color="#22D3EE" emissive="#22D3EE" emissiveIntensity={3} toneMapped={false} />
                        </mesh>
                    ))}
                    
                    <Sphere args={[0.15, 32, 32]} position={[1, -0.5, 1]}>
                        <MeshDistortMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={2} speed={3} distort={0.5} />
                    </Sphere>
                </group>
            </Float>
        </Canvas>
    )
}