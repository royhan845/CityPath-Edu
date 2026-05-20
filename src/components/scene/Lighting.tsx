"use client"

export default function Lighting() {
    return (
        <group>
            {/* Cahaya merata ke seluruh objek */}
            <ambientLight intensity={1} />
            
            {/* Cahaya utama (Matahari/Bulan) - ngasih bayangan dan highlight */}
            <directionalLight 
                position={[10, 20, 10]} 
                intensity={1.5} 
                color="#e2e8f0" 
            />
            
            {/* Lampu aksen (Cyber/Neon) dari bawah biar futuristik */}
            <pointLight 
                position={[-10, 10, -10]} 
                intensity={0.5} 
                color="#38bdf8" 
            />
        </group>
    );
}