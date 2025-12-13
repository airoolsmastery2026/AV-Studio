import React from 'react';

interface NeonButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'danger';
}

const NeonButton: React.FC<NeonButtonProps> = ({ 
  onClick, 
  children, 
  disabled = false, 
  className = '', 
  size = 'md',
  variant = 'primary'
}) => {
  const baseStyles = "relative font-bold uppercase transition-all duration-300 rounded-xl flex items-center justify-center gap-2 overflow-hidden group";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-lg tracking-wider"
  };

  const variantStyles = {
    primary: disabled 
      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
      : "bg-slate-900 text-primary border border-primary hover:bg-primary hover:text-white shadow-[0_0_10px_rgba(14,165,164,0.3)] hover:shadow-[0_0_20px_rgba(14,165,164,0.6)] active:scale-95",
    danger: disabled
       ? "bg-slate-800 text-slate-500"
       : "bg-slate-900 text-accent border border-accent hover:bg-accent hover:text-white shadow-[0_0_10px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.6)] active:scale-95"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {/* Glare effect */}
      <span className="absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent"></span>
      {children}
    </button>
  );
};

export default NeonButton;
