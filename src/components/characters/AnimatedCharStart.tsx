"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF, useAnimations } from "@react-three/drei"
import * as THREE from "three"
import { GRID_SIZE, SURFACE_Y } from "../../config"
import { playSound } from "../../utils/audio"

interface AnimatedCharProps {
    startNode: number;
    path: number[];
    rotStep: number;
    isPaused: boolean;
    skipTrigger: number;
    onNear: () => void;
}

export default function AnimatedCharStart({ startNode, path, rotStep, isPaused, skipTrigger, onNear }: AnimatedCharProps) {
    const groupRef = useRef<THREE.Group>(null!);
    // Load model & ambil animasinya
    const { scene, animations } = useGLTF("/models/character/character-male-d.glb");
    const { actions } = useAnimations(animations, groupRef);

    const [pathIndex, setPathIndex] = useState(0);
    const targetPos = useRef<THREE.Vector3 | null>(null);
    const currentAnim = useRef<string | null>(null);
    const hasArrived = useRef(false);
    const footstepAudio = useRef<HTMLAudioElement | null>(null);

    // Mencegah model menghilang saat keluar dari pandangan kamera utama
    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) child.frustumCulled = false;
        });
    }, [scene]);

    // Setup Audio
    useEffect(() => {
        if (typeof window !== 'undefined') {
            footstepAudio.current = new Audio("/sounds/footstep.mp3");
            footstepAudio.current.volume = 0.5;
            footstepAudio.current.playbackRate = 1.75;
            
            footstepAudio.current.ontimeupdate = () => {
                const audio = footstepAudio.current;
                if (!audio || !audio.duration) return;
                if (currentAnim.current !== "walk") {
                    audio.pause();
                    return;
                }
                const cutOffSeconds = 0.5;
                if (audio.currentTime >= audio.duration - cutOffSeconds) {
                    audio.currentTime = 0;
                    audio.play().catch(() => {});
                }
            };
        }
        return () => {
            if (footstepAudio.current) {
                footstepAudio.current.pause();
                footstepAudio.current.ontimeupdate = null;
                footstepAudio.current = null;
            }
        };
    }, []);

    const playAnim = (type: "idle" | "walk") => {
        if (currentAnim.current === type) return; 
        
        Object.values(actions).forEach(a => a?.fadeOut(0.2));
        
        const action = type === "walk" ? (
            actions["Walk"] || actions["walk"] || actions["Run"] || actions["run"]
        ) : (
            actions["Idle"] || actions["idle"]
        ); 

        if (action) action.reset().fadeIn(0.2).play();
        currentAnim.current = type;

        if (footstepAudio.current) {
            if (type === "walk" && !isPaused) {
                footstepAudio.current.play().catch(e => console.warn("Audio footstep diblokir:", e));
            } else {
                footstepAudio.current.pause();
                footstepAudio.current.currentTime = 0;
            }
        }
    };

    // Kalkulasi Koordinat Start
    const startX = Math.floor(startNode / GRID_SIZE) - GRID_SIZE / 2;
    const startZ = (startNode % GRID_SIZE) - GRID_SIZE / 2;

    // Reset rute & taruh karakter di Start
    useEffect(() => {
        if (path.length === 0 && groupRef.current) {
            setPathIndex(0);
            targetPos.current = null;
            hasArrived.current = false;
            groupRef.current.position.set(startX, SURFACE_Y, startZ);
            groupRef.current.rotation.set(0, rotStep * (Math.PI / 2), 0);
            playAnim("idle");
        }
    }, [path.length, startX, startZ, rotStep]);

    // Tentukan target berjalan (node selanjutnya)
    useEffect(() => {
        if (path.length > 0 && pathIndex < path.length && !isPaused) {
            const nextNode = path[pathIndex];
            const tX = Math.floor(nextNode / GRID_SIZE) - GRID_SIZE / 2;
            const tZ = (nextNode % GRID_SIZE) - GRID_SIZE / 2;
            targetPos.current = new THREE.Vector3(tX, SURFACE_Y, tZ);
        }
    }, [path, pathIndex, isPaused]);

    // Handle Jeda (Pause) animasi
    useEffect(() => {
        if (isPaused) {
            playAnim("idle");
            if (footstepAudio.current) footstepAudio.current.pause();
        } else if (path.length > 0 && pathIndex < path.length) {
            playAnim("walk");
        }
    }, [isPaused]);

    // SINKRONISASI LOGIKA SKIP ANIMASI (TELEPORTASI)
    useEffect(() => {
        if (skipTrigger > 0 && path.length > 0 && !hasArrived.current && groupRef.current) {
            // Ambil node terakhir dari rute
            const finalNode = path[path.length - 1];
            const finalX = Math.floor(finalNode / GRID_SIZE) - GRID_SIZE / 2;
            const finalZ = (finalNode % GRID_SIZE) - GRID_SIZE / 2;

            // Teleportasi karakter langsung ke tujuan akhir
            groupRef.current.position.set(finalX, SURFACE_Y, finalZ);
            
            // Matikan state berjalan
            targetPos.current = null;
            setPathIndex(path.length - 1);
            playAnim("idle");

            // Picu status selesai
            hasArrived.current = true;
            playSound("/sounds/success.mp3", 0.7); 
            onNear();
        }
    }, [skipTrigger, path, onNear]);

    useFrame((state, delta) => {
        if (!targetPos.current || !groupRef.current || isPaused) return;

        const currentPos = groupRef.current.position;
        const distance = currentPos.distanceTo(targetPos.current);

        if (distance < 0.05) {
            currentPos.copy(targetPos.current); 
            
            if (pathIndex === path.length - 1) {
                targetPos.current = null;
                playAnim("idle");
                if (!hasArrived.current) {
                    hasArrived.current = true;
                    playSound("/sounds/success.mp3", 0.7); 
                    onNear();
                }
            } else {
                setPathIndex(prev => prev + 1);
            }
        } else {
            playAnim("walk");
            const speed = 4; 
            const step = speed * delta;
            
            const direction = new THREE.Vector3().subVectors(targetPos.current, currentPos).normalize();
            currentPos.add(direction.multiplyScalar(step));
            
            const angle = Math.atan2(direction.x, direction.z);
            const targetQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            groupRef.current.quaternion.slerp(targetQuat, 0.15); 
        }
    });

    return (
        <group ref={groupRef}>
            <primitive object={scene} />
        </group>
    );
}