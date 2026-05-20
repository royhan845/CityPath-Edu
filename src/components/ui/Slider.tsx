import React from 'react';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    valueText?: string;
}

export default function Slider({ label, valueText, className = '', ...props }: SliderProps) {
    return (
        <div className={`w-full flex flex-col justify-center ${className}`}>
            {(label || valueText) && (
                <div className="flex justify-between items-end mb-2">
                    {label && <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>}
                    {valueText && <span className="text-[10px] font-mono text-[#22D3EE]">{valueText}</span>}
                </div>
            )}
            <input 
                type="range" 
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#22D3EE] hover:accent-[#38BDF8] transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                {...props} 
            />
        </div>
    )
}