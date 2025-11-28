import React from 'react';
import { Link } from 'react-router-dom';

interface TechButtonProps {
  to?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'neon-blue';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const TechButton: React.FC<TechButtonProps> = ({ 
  to, 
  children, 
  variant = 'primary', 
  className = '',
  onClick,
  type = 'button',
  disabled = false
}) => {
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return "bg-white border-black text-black hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]";
      case 'secondary':
        return "bg-transparent border-white/20 text-white hover:border-white hover:bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]";
      case 'neon-blue':
        return "bg-cyan-600 border-cyan-400 text-white hover:bg-cyan-500 hover:border-cyan-300"; // Blue background, neon blue border, no glow
      default:
        return "bg-white border-black text-black hover:bg-slate-100";
    }
  };

  const getCornerColor = () => {
    switch (variant) {
      case 'primary':
        return 'border-black';
      case 'secondary':
        return 'border-white';
      case 'neon-blue':
        return 'border-cyan-300';
      default:
        return 'border-black';
    }
  };

  const baseClasses = `group relative inline-flex items-center justify-center px-8 py-4 font-mono font-bold tracking-wider transition-all duration-300 border min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses()} ${className}`;
  const cornerColor = getCornerColor();

  const content = (
    <>
      {/* Top Left Corner */}
      <div className={`absolute top-0 left-0 w-2 h-2 border-t border-l ${cornerColor} opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0`} />
      
      {/* Bottom Right Corner */}
      <div className={`absolute bottom-0 right-0 w-2 h-2 border-b border-r ${cornerColor} opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0`} />
      
      <span className="flex items-center gap-3 uppercase text-sm">
        {children}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button 
      type={type} 
      onClick={onClick} 
      className={baseClasses}
      disabled={disabled}
    >
      {content}
    </button>
  );
};

export default TechButton;
