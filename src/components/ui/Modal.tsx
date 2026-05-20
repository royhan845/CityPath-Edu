import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-[650px]' }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#060816]/80 backdrop-blur-md transition-all duration-500">
            <div className={`bg-[#0B1120] border border-slate-700/50 p-6 md:p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full transform transition-all duration-300 flex flex-col max-h-[90vh] overflow-hidden ${maxWidth}`}>
                
                <div className="flex justify-between items-start mb-6 shrink-0 border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100 tracking-wide flex items-center gap-2">
                            <span className="text-[#22D3EE]">⟡</span> {title}
                        </h2>
                        {subtitle && <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-800/50 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30 text-xs">
                        ✖
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {children}
                </div>

            </div>
        </div>
    )
}