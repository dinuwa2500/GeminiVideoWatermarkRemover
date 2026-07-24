import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-slate-950 border border-sky-500/30 shadow-lg shadow-sky-500/20 overflow-hidden group ${className}`}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 opacity-25 group-hover:opacity-40 transition-opacity" />

      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 p-1.5"
      >
        <defs>
          <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Video Film Frame Outer Accent */}
        <rect x="4" y="8" width="32" height="24" rx="5" stroke="url(#logo-grad-1)" strokeWidth="2" strokeDasharray="4 2" opacity="0.6" />

        {/* Gemini AI Sparkle Star Core */}
        <path
          d="M20 6C20 12.6274 14.6274 18 8 18C14.6274 18 20 23.3726 20 30C20 23.3726 25.3726 18 32 18C25.3726 18 20 12.6274 20 6Z"
          fill="url(#logo-grad-1)"
          filter="url(#logo-glow)"
        />

        {/* Center Play Emblem */}
        <path
          d="M18.5 14.5L23.5 18L18.5 21.5V14.5Z"
          fill="#090d16"
          stroke="#38bdf8"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};
