type Pt = [number, number];

const pts = (a: Pt[]) => a.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

interface TrainIllustrationProps {
  className?: string;
}

const TrainIllustration = ({ className }: TrainIllustrationProps) => {
  const fx0 = 70;
  const fy0 = 150;
  const fw = 150;
  const fh = 200;
  const dx = 370;
  const dy = -90;
  const fx1 = fx0 + fw;
  const fy1 = fy0 + fh;

  // Point on the side face: u runs along the carriage, v runs top to bottom.
  const S = (u: number, v: number): Pt => [fx1 + dx * u, fy0 + dy * u + fh * v];

  const t0 = -0.15;
  const t1 = 1.2;
  const railY = (t: number) => fy1 + 16 + dy * t;

  const rail = (xr: number, id: string) => {
    const a: Pt = [xr + dx * t0, railY(t0)];
    const b: Pt = [xr + dx * t1, railY(t1)];
    return {
      id,
      a,
      b,
      points: pts([a, b, [b[0], b[1] + 5], [a[0], a[1] + 5]]),
    };
  };
  const rails = [rail(fx0, "rl-rail-left"), rail(fx1, "rl-rail-right")];

  const sleepers = Array.from({ length: 12 }, (_, k) => {
    const t = -0.1 + k * 0.1;
    const ax = fx0 + dx * t;
    const bx = fx1 + dx * t;
    const y = railY(t);
    return pts([
      [ax - 14, y + 1],
      [bx + 14, y + 1],
      [bx + 16, y + 9],
      [ax - 16, y + 9],
    ]);
  });

  const windows = Array.from({ length: 6 }, (_, i) => {
    const u0 = 0.07 + i * 0.152;
    const u1 = u0 + 0.11;
    return {
      glass: pts([S(u0, 0.15), S(u1, 0.15), S(u1, 0.47), S(u0, 0.47)]),
      shine: pts([S(u0 + 0.012, 0.17), S(u0 + 0.04, 0.17), S(u0 + 0.018, 0.45), S(u0 + 0.004, 0.45)]),
    };
  });

  const wheels = [0.1, 0.21, 0.79, 0.9].map((u) => {
    const [cx, cy] = S(u, 1);
    return { cx, cy: cy - 1 };
  });

  const bx = fx0 + fw * 0.5 + dx * 0.5;
  const by = fy0 + dy * 0.5;

  return (
    <svg
      className={className}
      viewBox="0 0 680 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="rl-orb-purple" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#4B0082" stopOpacity="0.6" />
          <stop offset="1" stopColor="#4B0082" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rl-orb-teal" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#006D77" stopOpacity="0.7" />
          <stop offset="1" stopColor="#006D77" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rl-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F4F7FB" />
          <stop offset="1" stopColor="#9FB0C8" />
        </linearGradient>
        <linearGradient id="rl-top" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2B4FB3" />
          <stop offset="1" stopColor="#0D1B2A" />
        </linearGradient>
        <linearGradient id="rl-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E3A8A" />
          <stop offset="1" stopColor="#0B132B" />
        </linearGradient>
        <linearGradient id="rl-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2F55B8" />
          <stop offset="1" stopColor="#050A18" />
        </linearGradient>
        <radialGradient id="rl-light" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF6D6" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFF6D6" stopOpacity="0" />
        </radialGradient>
        {rails.map((r) => (
          <linearGradient
            key={r.id}
            id={r.id}
            gradientUnits="userSpaceOnUse"
            x1={r.a[0]}
            y1={r.a[1]}
            x2={r.b[0]}
            y2={r.b[1]}
          >
            <stop offset="0" stopColor="#B9C6DA" stopOpacity="0" />
            <stop offset="0.25" stopColor="#B9C6DA" stopOpacity="0.9" />
            <stop offset="0.8" stopColor="#B9C6DA" stopOpacity="0.9" />
            <stop offset="1" stopColor="#B9C6DA" stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {/* Glow */}
      <circle cx="470" cy="190" r="230" fill="url(#rl-orb-purple)" />
      <circle cx="210" cy="370" r="200" fill="url(#rl-orb-teal)" />
      <ellipse cx="390" cy="330" rx="300" ry="34" fill="url(#rl-orb-teal)" />

      {/* Track */}
      {sleepers.map((p, i) => (
        <polygon key={i} points={p} fill="#1E3A8A" fillOpacity="0.5" />
      ))}
      {rails.map((r) => (
        <polygon key={r.id} points={r.points} fill={`url(#${r.id})`} />
      ))}

      {/* Roof */}
      <polygon
        points={pts([
          [fx0, fy0],
          [fx1, fy0],
          [fx1 + dx, fy0 + dy],
          [fx0 + dx, fy0 + dy],
        ])}
        fill="url(#rl-top)"
      />

      {/* Side body */}
      <polygon points={pts([S(0, 0), S(1, 0), S(1, 1), S(0, 1)])} fill="url(#rl-side)" />
      <polygon points={pts([S(0, 0.84), S(1, 0.84), S(1, 1), S(0, 1)])} fill="#0D1B2A" />
      <polygon points={pts([S(0, 0.62), S(1, 0.62), S(1, 0.72), S(0, 0.72)])} fill="#006D77" />
      <polygon points={pts([S(0, 0.745), S(1, 0.745), S(1, 0.765), S(0, 0.765)])} fill="#1E3A8A" />
      {windows.map((w, i) => (
        <g key={i}>
          <polygon points={w.glass} fill="url(#rl-glass)" />
          <polygon points={w.shine} fill="#FFFFFF" fillOpacity="0.16" />
        </g>
      ))}

      {/* Wheels */}
      {wheels.map((w, i) => (
        <g key={i}>
          <circle cx={w.cx} cy={w.cy} r="14" fill="#0B132B" />
          <circle cx={w.cx} cy={w.cy} r="5" fill="#5B6B7E" />
        </g>
      ))}

      {/* Pantograph */}
      <path
        d={`M${bx - 20} ${by} L${bx + 10} ${by - 32} L${bx - 6} ${by - 58}`}
        stroke="#B9C6DA"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1={bx - 24}
        y1={by - 60}
        x2={bx + 14}
        y2={by - 56}
        stroke="#B9C6DA"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Front face */}
      <rect x={fx0} y={fy0} width={fw} height={fh} rx="24" fill="url(#rl-front)" />
      <rect x={fx0} y={fy0 + 134} width={fw} height="16" fill="#006D77" />
      <rect x={fx0} y={fy0 + 154} width={fw} height="4" fill="#1E3A8A" fillOpacity="0.9" />
      <rect x={fx0 + 14} y={fy0 + 22} width={fw - 28} height="84" rx="16" fill="url(#rl-glass)" />
      <polygon
        points={`${fx0 + 26},${fy0 + 28} ${fx0 + 64},${fy0 + 28} ${fx0 + 36},${fy0 + 100} ${fx0 + 22},${fy0 + 100}`}
        fill="#FFFFFF"
        fillOpacity="0.14"
      />
      <rect x={fx0 + 55} y={fy0 + 112} width="40" height="12" rx="3" fill="#F4F7FB" />
      <circle cx={fx0 + 30} cy={fy1 - 46} r="28" fill="url(#rl-light)" />
      <circle cx={fx1 - 30} cy={fy1 - 46} r="28" fill="url(#rl-light)" />
      <circle cx={fx0 + 30} cy={fy1 - 46} r="8" fill="#FFF6D6" />
      <circle cx={fx1 - 30} cy={fy1 - 46} r="8" fill="#FFF6D6" />
      <rect x={fx0 + 12} y={fy1 - 26} width={fw - 24} height="14" rx="7" fill="#050A18" />
      <line
        x1={fx1}
        y1={fy0 + 10}
        x2={fx1}
        y2={fy1 - 10}
        stroke="#FFFFFF"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />

      {/* Speed lines */}
      {[
        [200, 10, 50],
        [236, 24, 64],
        [272, 4, 40],
      ].map(([y, x1, x2]) => (
        <line
          key={y}
          x1={x1}
          y1={y}
          x2={x2}
          y2={y}
          stroke="#FFFFFF"
          strokeOpacity="0.22"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};

export default TrainIllustration;