"use client"

import { Camera, Hand } from "lucide-react"
import { useSimulationStore } from "../../stores/useSimulationStore"

export default function InteractionModeToggle() {
    const { interactionMode, setInteractionMode, showTutorial, tutorialStep } = useSimulationStore();

    return (
        <div className={`md:hidden absolute top-6 left-4 flex backdrop-blur-md rounded-xl shadow-lg p-1 transition-all duration-500
            ${showTutorial && tutorialStep === 1 
                ? 'z-[999] ring-2 ring-inset ring-cyan-400 bg-[#0f172a]/90 shadow-[0_0_30px_rgba(34,211,238,0.5)] border border-transparent pointer-events-none' 
                : 'z-[100] bg-[#0B1120]/80 border border-slate-700/60'
            }
            ${showTutorial && tutorialStep !== 1 ? 'opacity-30 grayscale pointer-events-none' : ''}
        `}>
            <button
                onClick={() => setInteractionMode('camera')}
                className={`p-2 rounded-lg transition-all ${interactionMode === 'camera' ? 'bg-cyan-500 text-[#060816]' : 'text-slate-400 hover:text-white'}`}
            >
                <Camera size={16} />
            </button>
            <button
                onClick={() => setInteractionMode('draw')}
                className={`p-2 rounded-lg transition-all ${interactionMode === 'draw' ? 'bg-emerald-500 text-[#060816]' : 'text-slate-400 hover:text-white'}`}
            >
                <Hand size={16} />
            </button>
        </div>
    );
}