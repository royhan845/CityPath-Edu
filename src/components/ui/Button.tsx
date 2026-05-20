import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    icon?: React.ReactNode;
}

export default function Button({ children, variant = 'secondary', icon, className = '', ...props }: ButtonProps) {
    const baseStyle = "flex items-center justify-center gap-2 font-mono text-[10px] tracking-widest uppercase transition-all duration-300 rounded-[3px] active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
        primary: "bg-[#22D3EE] hover:bg-[#38BDF8] text-[#060816] font-bold px-6 py-2.5 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)] border border-[#22D3EE]",
        secondary: "bg-[#0F172A]/50 hover:bg-[#0F172A] border border-slate-700/50 hover:border-[#22D3EE]/50 text-slate-300 hover:text-[#22D3EE] px-5 py-2.5",
        danger: "bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 px-5 py-2.5",
        ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200 px-4 py-2"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
        </button>
    )
}