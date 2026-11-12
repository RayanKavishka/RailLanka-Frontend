"use client";

import { useId } from "react";

interface LoadingProps {
  fullScreen?: boolean;
  showIcon?: boolean;
}

// Geometry (viewBox 100 x 100, centre 50,50)
const C = 50;
const R = 40;
const STROKE = 6;
const CIRCUMFERENCE = 2 * Math.PI * R;
const ARC = CIRCUMFERENCE * 0.28; // visible arc length

const SPEED = 0.9;

const css = `
@keyframes rl-spin {
  to { transform: rotate(360deg); }
}
@keyframes rl-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.92); }
}

.rl-spin {
  transform-box: view-box;
  transform-origin: ${C}px ${C}px;
  animation: rl-spin ${SPEED}s linear infinite;
}

.rl-icon {
  transform-box: fill-box;
  transform-origin: center;
  animation: rl-pulse 1.8s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .rl-spin { animation-duration: 4s; }
  .rl-icon { animation: none; }
}
`;

const Loading = ({ fullScreen = true, showIcon = true }: LoadingProps) => {
  const uid = useId().replace(/:/g, "");
  const arcGrad = `rl-arc-${uid}`;
  const iconGrad = `rl-icon-${uid}`;

  return (
    <div
      role="status"
      aria-busy="true"
      className={`flex items-center justify-center bg-transparent ${
        fullScreen ? "min-h-screen w-full" : "min-h-[120px] w-full"
      }`}
    >
      <style>{css}</style>
      <span className="sr-only">Loading...</span>

      <svg viewBox="0 0 100 100" className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden="true">
        <defs>
          <linearGradient id={arcGrad} gradientUnits="userSpaceOnUse" x1="10" y1="50" x2="90" y2="50">
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
          <linearGradient id={iconGrad} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>

        {/* Soft track (works on light and dark backgrounds) */}
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="#14B8A6"
          strokeOpacity="0.15"
          strokeWidth={STROKE}
        />

        {/* Centre train icon */}
        {showIcon && (
          <g className="rl-icon">
            <g
              transform="translate(35 35) scale(1.25)"
              fill="none"
              stroke={`url(#${iconGrad})`}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1" />
              <path d="m9 15-1-1" />
              <path d="m15 15 1-1" />
              <path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z" />
              <path d="m8 19-2 3" />
              <path d="m16 19 2 3" />
            </g>
          </g>
        )}

        {/* Spinning arc */}
        <g className="rl-spin">
          <circle
            cx={C}
            cy={C}
            r={R}
            fill="none"
            stroke={`url(#${arcGrad})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${ARC} ${CIRCUMFERENCE - ARC}`}
          />
        </g>
      </svg>
    </div>
  );
};

export default Loading;