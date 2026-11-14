import { useId } from "react";

interface AiLogoProps {
  size?: number;
  className?: string;
}

const AiLogo = ({ size = 40, className }: AiLogoProps) => {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="RailLanka AI assistant"
    >
      <defs>
        <linearGradient
          id={`${id}-bg`}
          x1="4"
          y1="2"
          x2="44"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00A5B0" />
          <stop offset="1" stopColor="#0D1B2A" />
        </linearGradient>
      </defs>

      <rect width="48" height="48" rx="14" fill={`url(#${id}-bg)`} />

      <rect x="8" y="13" width="28" height="21" rx="8" fill="#FFFFFF" />
      <path d="M15 33 L12 41 L23 34 Z" fill="#FFFFFF" />

      <path
        transform="translate(0 1.5)"
        d="M22 15 C22.8 19.5 24.5 21.2 29 22 C24.5 22.8 22.8 24.5 22 29 C21.2 24.5 19.5 22.8 15 22 C19.5 21.2 21.2 19.5 22 15Z"
        fill="#006D77"
      />

      <path
        d="M37 5 C37.4 7.6 38.4 8.6 41 9 C38.4 9.4 37.4 10.4 37 13 C36.6 10.4 35.6 9.4 33 9 C35.6 8.6 36.6 7.6 37 5Z"
        fill="#7FD6DC"
      />
    </svg>
  );
};

export default AiLogo;