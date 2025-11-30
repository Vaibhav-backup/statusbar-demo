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
  const baseStyles = "relative px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transform active:translate-y-1 active:shadow-none font-mono";
  
  const variants = {
    // White/Zinc with a 3D feel -> Primary theme color driven
    primary: "bg-primary text-primary-fg shadow-[0_4px_0_0_rgba(var(--primary),0.5)] hover:bg-primary/90 hover:shadow-[0_4px_0_0_rgba(var(--primary),0.8)] hover:-translate-y-0.5",
    
    // Dark arcade button -> Surface driven
    secondary: "bg-surface-highlight text-foreground shadow-[0_4px_0_0_rgba(255,255,255,0.1)] hover:bg-surface-highlight/80 hover:text-white",
    
    // Cyberpunk Neon -> Main theme accent
    neon: "bg-primary text-primary-fg shadow-[0_0_15px_rgba(var(--primary),0.5),0_4px_0_0_rgba(var(--secondary),1)] hover:bg-primary/80 hover:shadow-[0_0_25px_rgba(var(--primary),0.8),0_4px_0_0_rgba(var(--secondary),1)] border border-primary/50",
    
    outline: "bg-transparent border-2 border-border text-muted hover:border-primary hover:text-primary hover:bg-surface/50",
    
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
    
    ghost: "bg-transparent text-muted hover:text-foreground hover:bg-surface/50 hover:scale-105 transition-transform"
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