import { Link, useLocation } from 'react-router-dom';

export const Logo = ({ className = "", hideText = false }: { className?: string, hideText?: boolean }) => {
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link to="/" onClick={handleClick} className={`flex items-center gap-3 group cursor-pointer ${className}`}>
    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
      {/* Circular Background */}
      <div className="absolute inset-0 bg-brand-accent/20 rounded-full border border-brand-accent/30 group-hover:scale-110 transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
      
      {/* Blue Tie Logo */}
      <svg viewBox="0 0 24 24" className="w-6 h-6 relative z-10 overflow-visible">
        <path 
          d="M12 4l3 5-3 11-3-11z" 
          fill="#3b82f6" 
          className="drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
        />
        <path 
          d="M12 4l1.5 2.5-1.5 1.5-1.5-1.5z" 
          fill="#60a5fa" 
        />
      </svg>
    </div>
    {!hideText && (
      <div className="flex flex-col leading-none">
        <span className="font-display text-xl font-black text-white tracking-tighter uppercase">jobytes</span>
        <span className="text-[10px] font-bold text-brand-accent tracking-[0.2em] uppercase opacity-80">Future Work</span>
      </div>
    )}
  </Link>
  );
};
