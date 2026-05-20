export interface BuildingConfig {
    id: number;
    name: string;
    path: string;
    image: string;
    sizeX: number;
    sizeZ: number;
    scale: number | [number, number, number];
    offset: [number, number];
    rotation?: [number, number, number];
}

export const BUILDINGS: Record<string, BuildingConfig> = {
    "bld-h": { 
        id: 7, sizeX: 1, sizeZ: 1, scale: [0.8, 0.8, 0.8], offset: [0.45, -0.2], rotation: [0, Math.PI, 0],
        path: "/models/building/building-h.glb", name: "Rumah Kecil (1x1)", image: "/thumbnails/building-h.png" 
    },
    "bld-n": { 
        id: 8, sizeX: 1, sizeZ: 1, scale: [0.65, 0.65, 0.65], offset: [0.3, -0.33], rotation: [0, Math.PI, 0],
        path: "/models/building/building-n.glb", name: "Pos Jaga (1x1)", image: "/thumbnails/building-n.png" 
    },
    "bld-o": { 
        id: 9, sizeX: 1, sizeZ: 1, scale: [0.8, 0.8, 0.8], offset: [0.33, -0.5], rotation: [0, Math.PI, 0],
        path: "/models/building/building-o.glb", name: "Gudang Mini (1x1)", image: "/thumbnails/building-o.png" 
    },
    "bld-d": { 
        id: 10, sizeX: 1, sizeZ: 1, scale: [0.8, 0.8, 0.8], offset: [0, 0], rotation: [0, Math.PI, 0],
        path: "/models/building/building-d.glb", name: "Pabrik Standar (1x1)", image: "/thumbnails/building-d.png" 
    },
    "bld-f": { 
        id: 11, sizeX: 2, sizeZ: 1, scale: [0.8, 0.8, 0.8], offset: [0.35, -0.21], rotation: [0, Math.PI, 0],
        path: "/models/building/building-f.glb", name: "Pabrik Cerobong (2x1)", image: "/thumbnails/building-f.png" 
    },
    "bld-r": { 
        id: 12, sizeX: 2, sizeZ: 1, scale: [0.8, 0.8, 0.8], offset: [0, 0], rotation: [0, Math.PI, 0],
        path: "/models/building/building-r.glb", name: "Gudang Panjang (2x1)", image: "/thumbnails/building-r.png" 
    },
    "bld-a": { 
        id: 13, sizeX: 2, sizeZ: 1, scale: [0.8, 0.8, 0.8], offset: [0, 0], rotation: [0, Math.PI, 0],
        path: "/models/building/building-a.glb", name: "Gedung Utama A (2x1)", image: "/thumbnails/building-a.png" 
    },
    "bld-c": { 
        id: 14, sizeX: 2, sizeZ: 2, scale: [0.8, 0.8, 0.8], offset: [-0.1, -0.1], rotation: [0, Math.PI, 0], 
        path: "/models/building/building-c.glb", name: "Pabrik Tangki C (2x2)", image: "/thumbnails/building-c.png" 
    },
};