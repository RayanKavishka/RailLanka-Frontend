import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthContext from "../hooks/useAuth";

/* -------------------------------------------------------------------------- */
/*  Types & icons                                                             */
/* -------------------------------------------------------------------------- */

interface IconProps {
  size?: number;
  className?: string;
}

const Icon = ({
  children,
  size = 20,
  className,
}: IconProps & { children: ReactNode }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const TrainIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1" />
    <path d="m9 15-1-1" />
    <path d="m15 15 1-1" />
    <path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z" />
    <path d="m8 19-2 3" />
    <path d="m16 19 2 3" />
  </Icon>
);

const HomeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 22V12h6v10" />
  </Icon>
);

const ArrowLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </Icon>
);

/* -------------------------------------------------------------------------- */
/*  Shared class names                                                        */
/* -------------------------------------------------------------------------- */

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#006D77]";

const CONTAINER = "mx-auto w-full max-w-[1440px] px-5 sm:px-10 lg:px-20";

const BTN = `inline-flex h-12 w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-xl px-6 text-[15px] font-semibold transition duration-150 hover:-translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:h-[52px] sm:w-auto sm:rounded-[14px] sm:px-7 sm:text-base ${FOCUS}`;

/* -------------------------------------------------------------------------- */
/*  Role-based "home" path                                                    */
/* -------------------------------------------------------------------------- */

const getHomePath = (signedIn: boolean, role?: string | null) => {
  if (!signedIn) return "/";

  switch (role) {
    case "ADMIN":
      return "/admin";
    case "PASSENGER":
      return "/passenger";
    case "TICKET_INSPECTOR":
      return "/inspector";
    default:
      return "/";
  }
};

/* -------------------------------------------------------------------------- */
/*  Animations (scoped with the nf- prefix)                                   */
/* -------------------------------------------------------------------------- */

const NF_CSS = `
@keyframes nf-drop{0%{opacity:0;transform:translateY(-70px)}55%{opacity:1;transform:translateY(10px)}75%{transform:translateY(-5px)}100%{opacity:1;transform:translateY(0)}}
@keyframes nf-pop{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes nf-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes nf-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes nf-sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3.5deg)}}
@keyframes nf-ladder{0%,100%{transform:rotate(-.6deg)}50%{transform:rotate(.6deg)}}
@keyframes nf-wave{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(10deg)}}
@keyframes nf-nod{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(4deg)}}
@keyframes nf-type{0%,100%{transform:translateY(0)}25%{transform:translateY(2px)}50%{transform:translateY(-1px)}75%{transform:translateY(2.5px)}}
@keyframes nf-glow{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes nf-twinkle{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1.15)}}
@keyframes nf-bob{0%,100%{transform:translateY(0);opacity:.45}50%{transform:translateY(-9px);opacity:1}}
@keyframes nf-ping{0%{transform:scale(1);opacity:.55}80%,100%{transform:scale(2.6);opacity:0}}

.nf-digit{opacity:0;animation:nf-drop .95s cubic-bezier(.22,.9,.3,1) both}
.nf-pop{opacity:0;animation:nf-pop .6s ease-out both}
.nf-rise{opacity:0;animation:nf-rise .7s ease-out both}
.nf-blob{animation:nf-float 9s ease-in-out infinite}
.nf-sway{transform-box:fill-box;transform-origin:50% 100%;animation:nf-sway 3.6s ease-in-out infinite}
.nf-ladder{transform-box:fill-box;transform-origin:50% 100%;animation:nf-ladder 4s ease-in-out infinite}
.nf-wave{transform-box:fill-box;transform-origin:0% 50%;animation:nf-wave 1.8s ease-in-out infinite}
.nf-nod{transform-box:fill-box;transform-origin:50% 100%;animation:nf-nod 2.6s ease-in-out infinite}
.nf-type{animation:nf-type .9s ease-in-out infinite}
.nf-glow{animation:nf-glow 1.6s ease-in-out infinite}
.nf-twinkle{transform-box:fill-box;transform-origin:50% 50%;animation:nf-twinkle 2.8s ease-in-out infinite}
.nf-bob{animation:nf-bob 3s ease-in-out infinite}
.nf-ping{animation:nf-ping 1.8s cubic-bezier(0,0,.2,1) infinite}

/* Very short viewports (phones in landscape): drop the secondary copy so
   everything still fits without scrolling. */
@media (max-height:520px){
  .nf-short-hide{display:none}
}

@media (prefers-reduced-motion:reduce){
  .nf-digit,.nf-pop,.nf-rise{animation:none;opacity:1;transform:none}
  .nf-blob,.nf-sway,.nf-ladder,.nf-wave,.nf-nod,.nf-type,.nf-glow,.nf-twinkle,.nf-bob,.nf-ping{animation:none}
}
`;

/* -------------------------------------------------------------------------- */
/*  Illustration                                                              */
/* -------------------------------------------------------------------------- */

const FOUR_PATH =
  "M140 0 H200 V185 H230 V240 H200 V280 H140 V240 H0 V185 Z M140 70 V185 H53 Z";
const ZERO_PATH =
  "M0 140 a120 140 0 1 0 240 0 a120 140 0 1 0 -240 0 Z M68 140 a52 82 0 1 0 104 0 a52 82 0 1 0 -104 0 Z";

const DIGITS = [
  { path: FOUR_PATH, x: 60, fill: "#006D77", line: "#0D1B2A", delay: 0.1 },
  { path: ZERO_PATH, x: 330, fill: "#0D1B2A", line: "#006D77", delay: 0.3 },
  { path: FOUR_PATH, x: 610, fill: "#006D77", line: "#0D1B2A", delay: 0.5 },
];

const SPARKLES = [
  { x: 150, y: 80, plus: false, color: "#7FD6DC", delay: 0 },
  { x: 262, y: 60, plus: true, color: "#006D77", delay: 0.6 },
  { x: 690, y: 60, plus: false, color: "#006D77", delay: 1.1 },
  { x: 885, y: 150, plus: true, color: "#7FD6DC", delay: 0.3 },
  { x: 560, y: 80, plus: true, color: "#7FD6DC", delay: 1.6 },
];

const Leaf = ({ rotate, fill }: { rotate: number; fill: string }) => (
  <g transform={`rotate(${rotate})`}>
    <path
      d="M0 0 C-16 -26 -14 -58 0 -84 C14 -58 16 -26 0 0Z"
      fill={fill}
    />
    <path d="M0 -4 V-68" stroke="#E4F3F4" strokeWidth={1.5} opacity={0.55} />
  </g>
);

const Plant = ({
  x,
  y,
  scale = 1,
  flip = false,
}: {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
    <g className="nf-sway">
      <Leaf rotate={-34} fill="#1B4332" />
      <Leaf rotate={32} fill="#2F9E6E" />
      <Leaf rotate={0} fill="#3DB37F" />
    </g>
    <path d="M-15 0 H15 L11 22 H-11Z" fill="#F4F6FA" stroke="#CBD5E1" />
  </g>
);

/*
 * The SVG keeps its aspect ratio (viewBox is cropped tightly to the artwork)
 * and is height-capped with viewport units, so on any screen the whole page
 * stays within one viewport. `preserveAspectRatio` (default "meet") centres the
 * artwork whenever the height cap kicks in.
 */
const Illustration = () => (
  <svg
    viewBox="-40 10 980 440"
    role="img"
    aria-label="404"
    className="mx-auto block h-auto max-h-[clamp(130px,34dvh,340px)] w-full max-w-[820px]"
  >
    {/* Soft background blob */}
    <path
      className="nf-blob"
      d="M90 110 C190 20 370 60 470 40 C600 18 740 10 840 90 C940 170 930 310 890 385 C850 455 620 440 480 438 C320 436 120 462 30 380 C-40 310 -10 190 90 110 Z"
      fill="#E4F3F4"
    />

    {/* Ground */}
    <ellipse cx="450" cy="402" rx="430" ry="22" fill="#BFE3E6" />

    {/* Sparkles */}
    {SPARKLES.map(({ x, y, plus, color, delay }) => (
      <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
        <g className="nf-twinkle" style={{ animationDelay: `${delay}s` }}>
          {plus ? (
            <path
              d="M0 -8 V8 M-8 0 H8"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
            />
          ) : (
            <circle r={5} fill={color} />
          )}
        </g>
      </g>
    ))}

    {/* Plants */}
    <g className="nf-pop" style={{ animationDelay: "0.9s" }}>
      <Plant x={12} y={382} scale={1.15} />
      <Plant x={888} y={382} scale={1.15} flip />
    </g>

    {/* 4 0 4 */}
    {DIGITS.map(({ path, x, fill, line, delay }, i) => (
      <g key={i} className="nf-digit" style={{ animationDelay: `${delay}s` }}>
        <g transform={`translate(${x - 10} 110)`}>
          <path
            d={path}
            fill="none"
            stroke={line}
            strokeWidth={2.5}
            strokeLinejoin="round"
            fillRule="evenodd"
          />
        </g>
        <g transform={`translate(${x} 120)`}>
          <path d={path} fill={fill} fillRule="evenodd" />
        </g>
      </g>
    ))}

    {/* Person on the ladder (left) */}
    <g className="nf-pop" style={{ animationDelay: "1.05s" }}>
      <g className="nf-ladder">
        {/* ladder */}
        <g stroke="#0D1B2A" strokeLinecap="round" fill="none">
          <path d="M50 400 L88 262" strokeWidth={5} />
          <path d="M118 400 L140 262" strokeWidth={5} />
          <path d="M61 360 H124.4" strokeWidth={4} />
          <path d="M70.7 325 H130" strokeWidth={4} />
          <path d="M80.3 290 H135.5" strokeWidth={4} />
          <path d="M88 262 H140" strokeWidth={4} />
        </g>

        {/* back arm */}
        <path
          d="M92 236 L82 262"
          stroke="#5BBFC6"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* legs */}
        <path
          d="M96 262 L90 322"
          stroke="#0D1B2A"
          strokeWidth={13}
          strokeLinecap="round"
        />
        <path
          d="M110 262 L117 322"
          stroke="#0D1B2A"
          strokeWidth={13}
          strokeLinecap="round"
        />
        <ellipse cx="88" cy="326" rx="8" ry="4" fill="#F4F6FA" />
        <ellipse cx="120" cy="326" rx="8" ry="4" fill="#F4F6FA" />
        {/* torso */}
        <rect x="89" y="222" width="30" height="46" rx="11" fill="#7FD6DC" />
        {/* reaching arm */}
        <g className="nf-wave">
          <path
            d="M114 232 L158 243"
            stroke="#58C2CB"
            strokeWidth={9}
            strokeLinecap="round"
          />
          <circle cx="161" cy="244" r="5.5" fill="#B9754B" />
        </g>
        {/* head */}
        <g className="nf-nod">
          <circle cx="102" cy="205" r="12" fill="#0D1B2A" />
          <circle cx="106" cy="210" r="10" fill="#B9754B" />
        </g>
      </g>

      {/* floating question marks */}
      <text
        className="nf-bob"
        x="186"
        y="226"
        fontSize="30"
        fontWeight={800}
        fill="#006D77"
      >
        ?
      </text>
      <text
        className="nf-bob"
        x="216"
        y="198"
        fontSize="20"
        fontWeight={800}
        fill="#7FD6DC"
        style={{ animationDelay: "0.8s" }}
      >
        ?
      </text>
    </g>

    {/* Person typing on the last 4 (right) */}
    <g className="nf-pop" style={{ animationDelay: "1.25s" }}>
      {/* legs */}
      <path
        d="M768 113.5 H811"
        stroke="#0D1B2A"
        strokeWidth={13}
        strokeLinecap="round"
      />
      <path
        d="M811 114 L816 152"
        stroke="#0D1B2A"
        strokeWidth={11}
        strokeLinecap="round"
      />
      <ellipse cx="820" cy="155" rx="9" ry="4" fill="#F4F6FA" />
      {/* torso */}
      <rect x="756" y="66" width="27" height="50" rx="10" fill="#1E3A8A" />
      {/* head */}
      <g className="nf-nod">
        <circle cx="768" cy="53" r="11.5" fill="#0D1B2A" />
        <circle cx="772" cy="57" r="9.5" fill="#B9754B" />
      </g>
      {/* laptop */}
      <rect x="795" y="104" width="30" height="4" rx="2" fill="#5B6B7E" />
      <polygon points="824,105 832,77 841,79 833,107" fill="#0D1B2A" />
      <polygon
        className="nf-glow"
        points="826,102 833,81 838,82 831,104"
        fill="#7FD6DC"
      />
      {/* typing arm */}
      <g className="nf-type">
        <path
          d="M774 82 L799 99"
          stroke="#1E3A8A"
          strokeWidth={8}
          strokeLinecap="round"
        />
        <circle cx="802" cy="101" r="5" fill="#B9754B" />
      </g>
    </g>
  </svg>
);

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

const NotFound = () => {
  const { activeRole } = useAuthContext();
  const navigate = useNavigate();

  const isSignedIn = Boolean(localStorage.getItem("ACCESS_TOKEN"));
  const homePath = getHomePath(isSignedIn, activeRole);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(homePath, { replace: true });
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-x-hidden bg-white text-[#0D1B2A] antialiased [font-family:'Plus_Jakarta_Sans',Inter,system-ui,-apple-system,'Segoe_UI',Roboto,sans-serif]">
      <style>{NF_CSS}</style>

      <header className={CONTAINER}>
        <div className="flex h-14 items-center sm:h-[68px]">
          <Link
            to={homePath}
            aria-label="RailLanka home"
            className={`inline-flex items-center gap-2.5 rounded-lg sm:gap-3 ${FOCUS}`}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#006D77] text-white sm:h-10 sm:w-10">
              <TrainIcon size={20} />
            </span>
            <span className="text-lg font-extrabold tracking-[-0.01em] text-[#0D1B2A] sm:text-2xl">
              RailLanka
            </span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center pb-6 pt-1 sm:pb-10">
        <div className={`${CONTAINER} text-center`}>
          <p
            className="nf-rise inline-flex items-center gap-2 rounded-full bg-[#E4F3F4] py-1.5 pl-3 pr-3.5 text-xs font-bold uppercase leading-none tracking-[0.14em] text-[#006D77] sm:text-[13px]"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="nf-ping absolute inline-flex h-full w-full rounded-full bg-[#006D77]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#006D77]" />
            </span>
            <span className="-mr-[0.14em]">Oops!</span>
          </p>

          <div className="mt-1 sm:mt-2">
            <Illustration />
          </div>

          <h1
            className="nf-rise mt-2 text-[24px] font-extrabold leading-8 tracking-[-0.02em] sm:mt-3 sm:text-[32px] sm:leading-10 lg:text-[36px]"
            style={{ animationDelay: "1.2s" }}
          >
            Page not found
          </h1>

          <span
            aria-hidden="true"
            className="nf-rise nf-short-hide mx-auto mt-2.5 block h-1 w-12 rounded-full bg-[#006D77]"
            style={{ animationDelay: "1.3s" }}
          />

          <p
            className="nf-rise nf-short-hide mx-auto mt-3 max-w-[460px] text-sm leading-6 text-[#5B6B7E] sm:mt-4 sm:text-base sm:leading-[26px]"
            style={{ animationDelay: "1.4s" }}
          >
            The page you are looking for may have moved, been renamed, or never
            existed. Let&apos;s get you back on the right track.
          </p>

          <div
            className="nf-rise mx-auto mt-5 flex w-full max-w-[420px] flex-col items-center justify-center gap-2.5 sm:mt-6 sm:max-w-none sm:flex-row sm:gap-3.5"
            style={{ animationDelay: "1.5s" }}
          >
            <Link
              to={homePath}
              replace
              className={`${BTN} bg-[#006D77] text-white shadow-[0_10px_28px_rgba(0,109,119,0.35)] hover:bg-[#005B64]`}
            >
              <HomeIcon size={20} />
              {isSignedIn ? "Back to my dashboard" : "Back to home"}
            </Link>
            <button
              type="button"
              onClick={goBack}
              className={`${BTN} cursor-pointer border border-[#0D1B2A] text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-white`}
            >
              <ArrowLeftIcon size={20} />
              Go back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;