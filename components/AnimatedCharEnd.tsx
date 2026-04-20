"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF, useAnimations } from "@react-three/drei"
import * as THREE from "three"
import { GRID_SIZE, SURFACE_Y } from "../config/constants"

const AnimatedCharEnd = ({ id, path, rotStep, isCharNear }: { id: number, path: number[], rotStep: number, isCharNear: boolean }) => {
    const groupRef = useRef<THREE.Group>(null!);
    const { scene, animations } = useGLTF("/models/character/character-female-d.glb");
    const { actions } = useAnimations(animations, groupRef);

    const currentAnim = useRef<string | null>(null);
    const targetPos = useRef(new THREE.Vector3());
    const CHAR_Y = SURFACE_Y;

    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) child.frustumCulled = false;
        });
    }, [scene]);

    useEffect(() => {
        const fX = Math.floor(id / GRID_SIZE) - GRID_SIZE / 2;
        const fZ = (id % GRID_SIZE) - GRID_SIZE / 2;

        if (groupRef.current) {
            let targetAngle = (rotStep * (Math.PI / 2)) + Math.PI;

            if (path.length >= 2) {
                const prevNode = path[path.length - 2]; 
                const mX = Math.floor(prevNode / GRID_SIZE) - GRID_SIZE / 2;
                const mZ = (prevNode % GRID_SIZE) - GRID_SIZE / 2;
                const angleOffset = 0; 
                targetAngle = Math.atan2(mX - fX, mZ - fZ) + angleOffset;

                if (isCharNear) {
                    const stopBackDistance = 0.25; 
                    const dirX = fX - mX; 
                    const dirZ = fZ - mZ;
                    const len = Math.sqrt(dirX*dirX + dirZ*dirZ);
                    
                    if (len > 0) {
                        const backOffsetX = (dirX / len) * stopBackDistance;
                        const backOffsetZ = (dirZ / len) * stopBackDistance;
                        targetPos.current.set(fX + backOffsetX, CHAR_Y, fZ + backOffsetZ);
                    }
                } else {
                    targetPos.current.set(fX, CHAR_Y, fZ);
                }
            } else {
                targetPos.current.set(fX, CHAR_Y, fZ);
            }

            groupRef.current.rotation.y = targetAngle;
            
            if (!isCharNear && path.length === 0) {
                groupRef.current.position.copy(targetPos.current);
            }
        }
    }, [id, path, rotStep, isCharNear]);

    const playAnim = (type: "idle") => {
        if (currentAnim.current === type) return; 
        Object.values(actions).forEach(a => a?.fadeOut(0.2));
        const action = actions["Idle"] || actions["idle"];
        if (action) action.reset().fadeIn(0.2).play();
        currentAnim.current = type;
    };

    useFrame(() => {
        if (!groupRef.current) return;
        playAnim("idle"); 
        groupRef.current.position.lerp(targetPos.current, 0.08); 
    });

    return <group ref={groupRef}><primitive object={scene} /></group>;
};

export default AnimatedCharEnd;