"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF, useAnimations } from "@react-three/drei"
import * as THREE from "three"
import { GRID_SIZE, SURFACE_Y } from "../config/constants"
import { playSound } from "../utils/audio"

const AnimatedCharStart = ({ startNode, path, rotStep, onNear }: { startNode: number, path: number[], rotStep: number, onNear: () => void }) => {
    const groupRef = useRef<THREE.Group>(null!);
    const { scene, animations } = useGLTF("/models/character/character-male-d.glb");
    const { actions } = useAnimations(animations, groupRef);

    const pathIndex = useRef(0);
    const position = useRef(new THREE.Vector3());
    const currentAnim = useRef<string | null>(null);
    const hasTriggeredNear = useRef(false);
    const hasArrived = useRef(false);
    const CHAR_Y = SURFACE_Y;

    const footstepAudio = useRef<HTMLAudioElement | null>(null);

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

    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) child.frustumCulled = false;
        });
    }, [scene]);

    useEffect(() => {
        const startX = Math.floor(startNode / GRID_SIZE) - GRID_SIZE / 2;
        const startZ = (startNode % GRID_SIZE) - GRID_SIZE / 2;
        position.current.set(startX, CHAR_Y, startZ);
        pathIndex.current = 0; 
        hasTriggeredNear.current = false;
        hasArrived.current = false;

        if (groupRef.current) {
            groupRef.current.position.copy(position.current);
            groupRef.current.rotation.y = rotStep * (Math.PI / 2); 
        }
    }, [startNode, path.length, rotStep]);

    const playAnim = (type: "idle" | "walk") => {
        if (currentAnim.current === type) return; 

        Object.values(actions).forEach(a => a?.fadeOut(0.2));

        const action = type === "walk" ? (
            actions["Walk"] || actions["walk"] || 
            actions["Run"] || actions["run"]
        ) : (
            actions["Idle"] || actions["idle"]
        ); 

        if (action) action.reset().fadeIn(0.2).play();

        currentAnim.current = type;

        if (footstepAudio.current) {
            if (type === "walk") {
                footstepAudio.current.play().catch(e => console.warn("Audio footstep diblokir:", e));
            } else {
                footstepAudio.current.pause();
                footstepAudio.current.currentTime = 0;
            }
        }
    };

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        if (path.length > 0 && pathIndex.current < path.length) { 
            playAnim("walk"); 
            
            if (path.length >= 2 && pathIndex.current >= path.length - 2) {
                if (!hasTriggeredNear.current) {
                    hasTriggeredNear.current = true;
                    onNear();
                }
            }

            const targetNode = path[pathIndex.current];
            const targetX = Math.floor(targetNode / GRID_SIZE) - GRID_SIZE / 2;
            const targetZ = (targetNode % GRID_SIZE) - GRID_SIZE / 2;
            let targetPos = new THREE.Vector3(targetX, CHAR_Y, targetZ);

            const direction = targetPos.clone().sub(position.current);
            const distance = direction.length();
            const step = 4.0 * Math.min(delta, 0.1); 

            const isLastNode = pathIndex.current === path.length - 1;
            const stopGap = 0.4;

            if (isLastNode && distance <= stopGap) {
                pathIndex.current = path.length;
                if (!hasArrived.current) {
                    hasArrived.current = true;
                    playSound("/sounds/success.mp3", 0.7); 
                }
            } else if (distance < step) {
                pathIndex.current += 1;
                position.current.copy(targetPos); 
            } else if (distance > 0.001) { 
                direction.normalize();
                position.current.add(direction.clone().multiplyScalar(4.0 * delta));
                const angleOffset = 0; 
                const angle = Math.atan2(direction.x, direction.z) + angleOffset;
                groupRef.current.quaternion.slerp(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle), 0.15); 
            }
        } else {
            playAnim("idle"); 
        }
        groupRef.current.position.copy(position.current);
    });

    return <group ref={groupRef}><primitive object={scene} /></group>;
};

export default AnimatedCharStart;