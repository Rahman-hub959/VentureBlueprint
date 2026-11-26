import React, { useEffect, useState } from "react";

interface ComplianceScoreRingProps {
  score?: number; // 0 to 100
  size?: number; // size in px, default 68
  strokeWidth?: number; // default 6
  className?: string;
  subtext?: string;
}

export const ComplianceScoreRing: React.FC<ComplianceScoreRingProps> = ({
  score = 96,
  size = 68,
  strokeWidth = 6,
  className = "",
  subtext = "/100",
}) => {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    // Smooth counter animation from 0 to target score
    let start = 0;
    const duration = 1200; // ms
    const stepTime = 20; // ms
    const steps = duration / stepTime;
    const increment = score / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setCurrentScore(score);
        clearInterval(timer);
      } else {
        setCurrentScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient Radial Glow */}
      <div
        className="absolute inset-0 rounded-full blur-md opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #C59B27 0%, #10B981 100%)",
        }}
      />

      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C59B27" />
            <stop offset="60%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <filter id="scoreGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#10B981" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-slate-200 dark:stroke-slate-800"
          fill="none"
        />

        {/* Animated Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="url(#scoreRingGradient)"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          filter="url(#scoreGlow)"
          style={{
            transition: "stroke-dashoffset 0.15s ease-out",
          }}
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <span className="text-sm font-extrabold text-[#0B2559] dark:text-white leading-none">
          {currentScore}
        </span>
        {subtext && (
          <span className="text-[9px] font-bold text-[#C59B27] leading-none mt-0.5">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
