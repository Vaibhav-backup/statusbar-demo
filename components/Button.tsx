import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'neon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  // Base: bold font, uppercase, tracking, rounded corners but blocky
  const baseStyles = "relative px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transform active:translate-y-1 active:shadow-none";
  
  const variants = {
    // White/Zinc with a 3D feel
    primary: "bg-zinc-100 text-zinc-950 shadow-[0_4px_0_0_rgba(161,161,170,1)] hover:bg-white hover:shadow-[0_4px_0_0_rgba(255,255,255,1)] hover:-translate-y-0.5",
    
    // Dark arcade button
    secondary: "bg-zinc-800 text-zinc-100 shadow-[0_4px_0_0_rgba(39,39,42,1)] hover:bg-zinc-700 hover:text-white",
    
    // Cyberpunk Neon Purple
    neon: "bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5),0_4px_0_0_rgba(109,40,217,1)] hover:bg-violet-500 hover:shadow-[0_0_25px_rgba(139,92,246,0.8),0_4px_0_0_rgba(109,40,217,1)] border border-violet-400/50",
    
    outline: "bg-transparent border-2 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white hover:bg-zinc-900",
    
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
    
    ghost: "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/50 hover:scale-105 transition-transform"
  };

  const loadingVariant = "opacity-80 cursor-wait";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${isLoading ? loadingVariant : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="flex gap-1 items-center">
            <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </>
      ) : children}
    </button>
  );
};