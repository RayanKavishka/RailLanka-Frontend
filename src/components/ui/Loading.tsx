"use client";

import { useId } from "react";


interface LoadingProps {
  fullScreen?: boolean;
  showIcon?: boolean;
}

// Geometry (viewBox 232 x 232, centre 116,116)
const C = 116;
const R = 83.5;
const STROKE = 24;

const polar = (deg: number, r = R) => {
  const a = (deg * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
};

const arcDark = polar(-27);
const arcLight = polar(169);
const arcPath = `M ${arcDark.x} ${arcDark.y} A ${R} ${R} 0 1 1 ${arcLight.x} ${arcLight.y}`;

const DOTS = [
  { deg: -48, r: 10, fill: "#38BDF8" },
  { deg: -70, r: 11, fill: "#2DD4BF" },
  { deg: -90, r: 12, fill: "#14B8A6" },
];

const SPEED = 1.2;

const css = `
@keyframes rl-spin { 
  to { transform: rotate(-360deg); } 
}

.rl-spin {
  transform-box: view-box;
  transform-origin: ${C}px ${C}px;
  animation: rl-spin ${SPEED}s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .rl-spin { animation-duration: 6s; }
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
        fullScreen ? "min-h-screen w-full" : "min-h-[200px] w-full"
      }`}
    >
      <style>{css}</style>
      <span className="sr-only">Loading...</span>

      {/* SVG Loader directly rendered without background badge wrapper */}
      <svg
        viewBox="0 0 232 232"
        className="h-28 w-28 sm:h-36 sm:w-36"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={arcGrad}
            gradientUnits="userSpaceOnUse"
            x1={arcLight.x}
            y1={arcLight.y}
            x2={arcDark.x}
            y2={arcDark.y}
          >
            <stop offset="0%" stopColor="#14B8A6" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
          <linearGradient
            id={iconGrad}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="24"
            y2="24"
          >
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
        </defs>

        {/* Track Ring */}
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="#334155"
          strokeWidth={STROKE}
          strokeOpacity="0.4"
        />

        {/* Centre Train Icon */}
        {showIcon && (
          <g
            transform="translate(92 92) scale(2)"
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
        )}

        {/* Animated Arc + Leading Dots */}
        <g className="rl-spin">
          <path
            d={arcPath}
            fill="none"
            stroke={`url(#${arcGrad})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          {DOTS.map((d) => {
            const p = polar(d.deg);
            return <circle key={d.deg} cx={p.x} cy={p.y} r={d.r} fill={d.fill} />;
          })}
        </g>
      </svg>
    </div>
  );
};

export default Loading;