"use client"

import { Grid as DreiGrid } from "@react-three/drei"

export default function Environment() {
    return (
        <group>
            {/* Grid tanpa batas untuk memberi kesan "Virtual Space" */}
            <DreiGrid 
                position={[0, -0.11, 0]} 
                infiniteGrid 
                sectionSize={1} 
                sectionColor="#1e293b" 
                cellColor="#0f172a" 
                fadeDistance={40} 
            />
        </group>
    );
}