"use client"

export default function Lighting() {
    return (
        <group>
            {/* 1. Ambient Light - Diredupkan drastis agar bayangan lebih pekat & dramatis */}
            <ambientLight intensity={0.2} color="#94a3b8" />
            
            {/* 2. Hemisphere Light - Gradasi warna dari langit (gelap) ke pantulan tanah (cyan) */}
            <hemisphereLight 
                color="#0f172a" 
                groundColor="#22d3ee" 
                intensity={0.6} 
            />
            
            {/* 3. Main Directional (Key Light) - Cahaya utama yang mencetak bayangan */}
            <directionalLight 
                position={[15, 30, 15]} 
                intensity={2.5} 
                color="#ffffff" 
                castShadow // Wajib untuk mengaktifkan bayangan
                shadow-mapSize={[2048, 2048]} // Resolusi bayangan HD
                shadow-camera-near={0.5}
                shadow-camera-far={60}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
                shadow-bias={-0.0005} // Mencegah artefak garis hitam pada objek
            />
            
            {/* 4. Accent Light (Cyber Glow) - Cahaya neon biru dari sudut bawah */}
            <pointLight 
                position={[-15, 5, -15]} 
                intensity={150} // Di Three.js modern, pointLight butuh angka besar agar decay-nya natural
                color="#38bdf8" 
                distance={40}
                decay={1.5}
            />
            
            {/* 5. Second Accent (Emerald Glow) - Dimensi warna tambahan di sudut berlawanan */}
            <pointLight 
                position={[15, 5, -15]} 
                intensity={100} 
                color="#10b981" 
                distance={40}
                decay={1.5}
            />
            
            {/* 6. Fog (Kabut Kedalaman) - Menyembunyikan ujung grid agar membaur dengan background */}
            <fog attach="fog" args={["#050816", 15, 45]} />
        </group>
    );
}