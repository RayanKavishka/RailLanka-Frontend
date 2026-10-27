import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import TrainIllustration from "../../components/auth/TrainIllustration";

export interface SearchParams {
  from: string;
  to: string;
  /** ISO date, yyyy-mm-dd */
  date: string;
  passengers: number;
}

export interface PassengerDashboardProps {
  /** Called when the search form is submitted with valid values. */
  onSearch?: (params: SearchParams) => void;
  /** Router path used by the footer "Login" link. */
  loginTo?: string;
  /** Router path used by the footer "Register" link and the "Create account" banner. */
  registerTo?: string;
}

interface Route {
  id: string;
  tag: string;
  /** Station names used to prefill the search form. */
  from: string;
  to: string;
  /** Short label shown on the card. */
  title: string;
  duration: string;
  /** Lowest fare in LKR, already formatted. */
  fare: string;
  /** Full Tailwind background class for the card header. */
  gradient: string;
}

interface FooterLink {
  label: string;
  /** Router path (or mailto:/tel: URL). Omit for plain text. */
  to?: string;
}

interface FooterColumn {
  title: string;
  className?: string;
  links: FooterLink[];
}

interface IconProps {
  size?: number;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  App paths – change these in one place to match your router                */
/* -------------------------------------------------------------------------- */

const PATHS = {
  home: "/dashboard",
  search: "/search",
  tickets: "/tickets",
  history: "/history",
  profile: "/profile",
  help: "/help",
  routes: "/routes",
  privacy: "/privacy",
  terms: "/terms",
} as const;

/* -------------------------------------------------------------------------- */
/*  Icons (inline so the file has no dependencies besides React)              */
/* -------------------------------------------------------------------------- */

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

const TicketIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </Icon>
);

const QrIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect width="5" height="5" x="3" y="3" rx="1" />
    <rect width="5" height="5" x="16" y="3" rx="1" />
    <rect width="5" height="5" x="3" y="16" rx="1" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v.01" />
    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
    <path d="M3 12h.01" />
    <path d="M12 3h.01" />
    <path d="M12 16v.01" />
    <path d="M16 12h1" />
    <path d="M21 12v.01" />
    <path d="M12 21v-1" />
  </Icon>
);

const ShieldIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);

const MailIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </Icon>
);

const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Icon>
);

const PinIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </Icon>
);

const UsersIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

const SwapIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m8 3-4 4 4 4" />
    <path d="M4 7h16" />
    <path d="m16 21 4-4-4-4" />
    <path d="M20 17H4" />
  </Icon>
);

const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Icon>
);

const ClockIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Icon>
);

const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </Icon>
);

const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
);

/* -------------------------------------------------------------------------- */
/*  Shared class names                                                        */
/* -------------------------------------------------------------------------- */

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#7FD6DC]";

/** Layout, hover lift and focus ring shared by every button. Size and colour are added per button. */
const BTN = `inline-flex items-center justify-center gap-2.5 whitespace-nowrap transition duration-150 hover:-translate-y-px motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${FOCUS}`;

const CONTAINER = "mx-auto w-full max-w-[1440px] px-5 sm:px-10 lg:px-20";

const EYEBROW =
  "text-sm font-bold uppercase leading-[18px] tracking-[0.14em] text-[#006D77]";

const H2 =
  "mt-3 text-[28px] font-extrabold leading-9 tracking-[-0.02em] text-[#0D1B2A] sm:text-[36px] sm:leading-[44px] lg:text-[40px] lg:leading-[48px]";

const FIELD_TEXT = "w-full text-[17px] font-bold leading-6 text-[#0D1B2A]";

const INPUT = `${FIELD_TEXT} appearance-none border-0 bg-transparent p-0 outline-none placeholder:font-medium placeholder:text-[#9AA7B8]`;

const FOOTER_LINK =
  "break-words text-sm leading-5 text-white/[0.65] sm:whitespace-nowrap";

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
  { label: "Home", to: PATHS.home, end: true },
  { label: "Search Journeys", to: PATHS.search, end: false },
  { label: "My Tickets", to: PATHS.tickets, end: false },
  { label: "Booking History", to: PATHS.history, end: false },
];

const TRUST_ITEMS = [
  { icon: QrIcon, label: "QR e-tickets" },
  { icon: ShieldIcon, label: "Secure payment" },
  { icon: MailIcon, label: "Email confirmation" },
];

const STATIONS = [
  "Colombo Fort",
  "Maradana",
  "Mount Lavinia",
  "Bentota",
  "Hikkaduwa",
  "Galle",
  "Matara",
  "Peradeniya",
  "Kandy",
  "Nanu Oya",
  "Ella",
  "Badulla",
  "Anuradhapura",
  "Vavuniya",
  "Jaffna",
  "Batticaloa",
];

const ROUTES: Route[] = [
  {
    id: "kandy",
    tag: "Intercity",
    from: "Colombo Fort",
    to: "Kandy",
    title: "Colombo → Kandy",
    duration: "2h 45m",
    fare: "450",
    gradient: "bg-[linear-gradient(135deg,#006D77_0%,#1B4332_100%)]",
  },
  {
    id: "galle",
    tag: "Coastal line",
    from: "Colombo Fort",
    to: "Galle",
    title: "Colombo → Galle",
    duration: "2h 30m",
    fare: "400",
    gradient: "bg-[linear-gradient(135deg,#1E3A8A_0%,#0D1B2A_100%)]",
  },
  {
    id: "ella",
    tag: "Hill country",
    from: "Colombo Fort",
    to: "Ella",
    title: "Colombo → Ella",
    duration: "9h 05m",
    fare: "1,100",
    gradient: "bg-[linear-gradient(135deg,#4B0082_0%,#0B132B_100%)]",
  },
  {
    id: "jaffna",
    tag: "Northern line",
    from: "Colombo Fort",
    to: "Jaffna",
    title: "Colombo → Jaffna",
    duration: "6h 40m",
    fare: "1,350",
    gradient: "bg-[linear-gradient(135deg,#1B4332_0%,#0D1B2A_100%)]",
  },
];

const FEATURES = [
  {
    icon: QrIcon,
    title: "QR e-tickets",
    body: "Every ticket carries a secure QR code that inspectors validate on the platform in seconds.",
  },
  {
    icon: ShieldIcon,
    title: "Secure online payment",
    body: "Pay in Sri Lankan rupees. Your ticket is issued only after your payment is confirmed.",
  },
  {
    icon: MailIcon,
    title: "Email confirmation",
    body: "Your e-ticket and booking reference land in your inbox as soon as you are booked.",
  },
];

const getFooterColumns = (
  loginTo: string,
  registerTo: string,
): FooterColumn[] => [
  {
    title: "Quick links",
    links: [
      { label: "Home", to: PATHS.home },
      { label: "Search Journeys", to: PATHS.search },
      { label: "My Tickets", to: PATHS.tickets },
      { label: "Booking History", to: PATHS.history },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", to: loginTo },
      { label: "Register", to: registerTo },
      { label: "My Profile", to: PATHS.profile },
      { label: "Help centre", to: PATHS.help },
    ],
  },
  {
    title: "Contact",
    className: "col-span-2 sm:col-span-1",
    links: [
      { label: "support@raillanka.lk", to: "mailto:support@raillanka.lk" },
      { label: "+94 11 234 5678", to: "tel:+94112345678" },
      { label: "Colombo Fort, Sri Lanka" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

/** 2026-10-31 -> "Sat, 31 Oct 2026" */
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "Select date";
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatToParts(new Date(y, m - 1, d));
  const get = (t: string) => parts.find((x) => x.type === t)?.value ?? "";
  return `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")}`;
};

const scrollBehavior = (): ScrollBehavior =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

/* -------------------------------------------------------------------------- */
/*  Small building blocks (kept outside the page so inputs never remount)     */
/* -------------------------------------------------------------------------- */

const Brand = () => (
  <Link
    to={PATHS.home}
    aria-label="RailLanka home"
    className={`inline-flex items-center gap-3 ${FOCUS}`}
  >
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#006D77] text-white">
      <TrainIcon size={22} />
    </span>
    <span className="text-xl font-extrabold tracking-[-0.01em] text-white sm:text-2xl">
      RailLanka
    </span>
  </Link>
);

const Field = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) => (
  <label className="group flex min-w-0 cursor-text items-center gap-3.5 rounded-2xl border border-[#E2E7EF] p-3 sm:flex-1 sm:basis-0 lg:rounded-none lg:border-0 lg:p-0">
    <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] bg-[#006D77]/10 text-[#006D77] transition-shadow group-focus-within:shadow-[0_0_0_3px_rgba(0,109,119,0.25)]">
      {icon}
    </span>
    <span className="relative flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-[0.08em] text-[#5B6B7E]">
        {label}
      </span>
      {children}
    </span>
  </label>
);

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

const PassengerDashboard = ({
  onSearch,
  loginTo = "/login",
  registerTo = "/register",
}: PassengerDashboardProps) => {
  const today = toISODate(new Date());
  const stationListId = useId();
  const menuId = useId();
  const searchRef = useRef<HTMLFormElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const footerColumns = getFooterColumns(loginTo, registerTo);

  const [from, setFrom] = useState("Colombo Fort");
  const [to, setTo] = useState("Kandy");
  const [date, setDate] = useState(today);
  const [passengers, setPassengers] = useState(2);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  /* Close the mobile menu on navigation, Escape and outside taps. */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen]);

  const swapStations = () => {
    setFrom(to);
    setTo(from);
  };

  const focusSearch = () => {
    const form = searchRef.current;
    if (!form) return;
    form.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
    form.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const start = from.trim();
    const end = to.trim();

    if (!start || !end) {
      setError("Choose both a departure and an arrival station.");
      return;
    }
    if (start.toLowerCase() === end.toLowerCase()) {
      setError("Departure and arrival stations must be different.");
      return;
    }
    if (!date || date < today) {
      setError("Pick a travel date from today onwards.");
      return;
    }

    setError("");
    onSearch?.({ from: start, to: end, date, passengers });
  };

  const pickRoute = (route: Route) => {
    setFrom(route.from);
    setTo(route.to);
    setError("");
    searchRef.current?.scrollIntoView({
      behavior: scrollBehavior(),
      block: "center",
    });
  };

  return (
    <div
      id="top"
      className="bg-white text-[#0D1B2A] antialiased [font-family:'Plus_Jakarta_Sans',Inter,system-ui,-apple-system,'Segoe_UI',Roboto,sans-serif]"
    >
      {/* ------------------------------ Hero ------------------------------ */}
      <header className="overflow-hidden bg-[linear-gradient(180deg,#0D1B2A_0%,#13264F_60%,#0B132B_100%)] pb-12 text-white sm:pb-16">
        <div className={CONTAINER}>
          <nav
            ref={navRef}
            aria-label="Primary"
            className="relative flex h-[72px] items-center justify-between gap-4 md:h-[88px]"
          >
            <Brand />

            {/* Tablet / laptop: inline links */}
            <ul className="hidden items-center gap-x-6 text-[15px] font-medium text-white/75 md:flex lg:gap-x-[42px]">
              {NAV_LINKS.map(({ label, to: path, end }) => (
                <li key={label}>
                  <NavLink
                    to={path}
                    end={end}
                    className={({ isActive }) =>
                      `rounded transition-colors hover:text-white ${FOCUS} ${
                        isActive ? "font-semibold text-white" : ""
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Mobile: burger */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className={`grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-white/25 text-white transition-colors hover:bg-white/10 md:hidden ${FOCUS}`}
            >
              {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
            </button>

            {menuOpen && (
              <div
                id={menuId}
                className="absolute inset-x-0 top-full z-30 mt-1 md:hidden"
              >
                <ul className="flex flex-col gap-1 rounded-2xl border border-white/15 bg-[#0D1B2A] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                  {NAV_LINKS.map(({ label, to: path, end }) => (
                    <li key={label}>
                      <NavLink
                        to={path}
                        end={end}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `block rounded-xl px-4 py-3 text-base transition-colors hover:bg-white/10 hover:text-white ${FOCUS} ${
                            isActive
                              ? "bg-white/10 font-semibold text-white"
                              : "font-medium text-white/75"
                          }`
                        }
                      >
                        {label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>

          <div className="grid items-center gap-8 pt-4 sm:gap-10 sm:pt-6 md:grid-cols-2 md:gap-8 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:gap-10">
            <div>
              <span className="inline-flex min-h-[34px] items-center gap-2.5 rounded-full border border-white/[0.22] bg-white/10 px-4 py-1.5 text-[13px] font-medium leading-[18px] text-white/90 sm:text-sm">
                <TicketIcon size={16} className="shrink-0 text-[#7FD6DC]" />
                Official e-ticketing for Sri Lanka Railways
              </span>

              <h1 className="mt-6 text-[40px] font-extrabold leading-[46px] tracking-[-0.025em] sm:mt-[30px] sm:text-[48px] sm:leading-[54px] md:mt-6 md:text-[44px] md:leading-[50px] lg:mt-[30px] lg:text-[72px] lg:leading-[78px]">
                Your Journey
                <span className="block text-[#7FD6DC]">Starts Here</span>
              </h1>

              <p className="mt-5 max-w-[480px] text-base leading-[26px] text-white/[0.72] sm:mt-8 lg:text-lg lg:leading-7">
                Search journeys, choose your class and receive a QR e-ticket in
                your inbox in minutes. No queues, no paper.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3.5 md:flex-col lg:flex-row">
                <button
                  type="button"
                  onClick={focusSearch}
                  className={`${BTN} h-[52px] w-full cursor-pointer rounded-[14px] bg-[#006D77] px-7 text-base font-semibold text-white shadow-[0_10px_28px_rgba(0,109,119,0.35)] sm:w-auto md:w-full lg:w-auto`}
                >
                  <SearchIcon size={20} />
                  Search Journeys
                </button>
                <Link
                  to={PATHS.tickets}
                  className={`${BTN} h-[52px] w-full rounded-[14px] border border-white px-7 text-base font-semibold text-white sm:w-auto md:w-full lg:w-auto`}
                >
                  View My Tickets
                </Link>
              </div>

              <ul className="mt-[26px] flex flex-wrap gap-x-7 gap-y-3.5 text-sm leading-[18px] text-white/80">
                {TRUST_ITEMS.map(({ icon: Glyph, label }) => (
                  <li key={label} className="inline-flex items-center gap-2">
                    <Glyph size={18} className="text-[#7FD6DC]" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <TrainIllustration className="mx-auto block h-auto w-full max-w-[420px] sm:max-w-[520px] md:max-w-none" />
          </div>

          {/* --------------------------- Search --------------------------- */}
          <form
            id="search"
            ref={searchRef}
            onSubmit={handleSubmit}
            noValidate
            className="mt-8 flex scroll-mt-6 flex-col gap-4 rounded-3xl bg-white p-4 text-[#0D1B2A] shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5 sm:rounded-[28px] sm:p-6 lg:flex lg:flex-row lg:items-center lg:gap-5 lg:py-5 lg:pl-8 lg:pr-3"
          >
            {/* From · swap · To  (stacked on mobile, side by side on tablet, inline on laptop) */}
            <div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row sm:items-center sm:gap-4 lg:contents">
              <Field icon={<PinIcon size={22} />} label="From">
                <input
                  className={INPUT}
                  list={stationListId}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Departure station"
                  autoComplete="off"
                />
              </Field>

              <button
                type="button"
                onClick={swapStations}
                aria-label="Swap departure and arrival stations"
                className={`mx-auto grid h-10 w-10 shrink-0 rotate-90 cursor-pointer place-items-center rounded-full bg-[#0D1B2A] text-white transition-transform duration-200 hover:rotate-[270deg] motion-reduce:transition-none sm:h-11 sm:w-11 sm:rotate-0 sm:hover:rotate-180 ${FOCUS}`}
              >
                <SwapIcon size={18} />
              </button>

              <Field icon={<PinIcon size={22} />} label="To">
                <input
                  className={INPUT}
                  list={stationListId}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Arrival station"
                  autoComplete="off"
                />
              </Field>
            </div>

            <span
              aria-hidden="true"
              className="hidden h-11 w-px shrink-0 bg-[#E2E7EF] lg:block"
            />

            <Field icon={<CalendarIcon size={22} />} label="Travel date">
              <span className={FIELD_TEXT}>{formatDate(date)}</span>
              {/* Invisible native date input laid over the formatted text. */}
              <input
                type="date"
                min={today}
                value={date}
                aria-label="Travel date"
                onChange={(e) => setDate(e.target.value)}
                onClick={(e) => e.currentTarget.showPicker?.()}
                className="absolute inset-0 h-full w-full cursor-pointer border-0 p-0 opacity-0"
              />
            </Field>

            <span
              aria-hidden="true"
              className="hidden h-11 w-px shrink-0 bg-[#E2E7EF] lg:block"
            />

            <Field icon={<UsersIcon size={22} />} label="Passengers">
              <select
                className={`${INPUT} cursor-pointer`}
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Adult" : "Adults"}
                  </option>
                ))}
              </select>
            </Field>

            <button
              type="submit"
              className={`${BTN} h-[56px] w-full cursor-pointer rounded-[18px] bg-[#006D77] text-base font-bold text-white sm:col-span-2 lg:h-[59px] lg:w-[189px] lg:shrink-0`}
            >
              <SearchIcon size={20} />
              Search Journeys
            </button>

            <datalist id={stationListId}>
              {STATIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </form>

          {error && (
            <p role="alert" className="mt-4 text-center text-sm text-[#FFB4B4]">
              {error}
            </p>
          )}
        </div>
      </header>

      <main>
        {/* --------------------------- Routes ---------------------------- */}
        <section id="routes" className="bg-[#F4F6FA] py-16 sm:py-20 lg:py-24">
          <div className={CONTAINER}>
            <div className="mb-8 flex flex-col items-start gap-4 sm:mb-11 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div>
                <p className={EYEBROW}>Popular destinations</p>
                <h2 className={H2}>Where would you like to go?</h2>
              </div>
              <Link
                to={PATHS.routes}
                className={`inline-flex shrink-0 items-center gap-2 text-base font-semibold text-[#006D77] hover:underline ${FOCUS}`}
              >
                View all routes
                <ArrowRightIcon size={18} />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
              {ROUTES.map((route) => (
                <article
                  key={route.id}
                  className="overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_rgba(13,27,42,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(13,27,42,0.14)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div
                    className={`relative flex h-[170px] flex-col items-start justify-between px-[22px] pb-[22px] pt-[26px] text-white sm:h-[190px] sm:pb-[26px] sm:pt-[30px] ${route.gradient}`}
                  >
                    <span className="rounded-full bg-white/20 px-3.5 text-xs font-semibold leading-[27px]">
                      {route.tag}
                    </span>
                    <TrainIcon
                      size={40}
                      className="absolute right-[22px] top-6 opacity-[0.35]"
                    />
                    <h3 className="text-[22px] font-extrabold leading-[28px] tracking-[-0.01em] sm:text-2xl sm:leading-[30px] xl:text-[22px] xl:leading-[28px]">
                      {route.title}
                    </h3>
                  </div>

                  <div className="flex h-[81px] items-center justify-between px-[22px]">
                    <div>
                      <p className="flex items-center gap-1.5 text-[13px] text-[#5B6B7E]">
                        <ClockIcon size={15} />
                        {route.duration}
                      </p>
                      <p className="mt-1 text-xl font-extrabold text-[#0D1B2A]">
                        <span className="mr-0.5 text-[13px] font-medium text-[#5B6B7E]">
                          from
                        </span>{" "}
                        LKR {route.fare}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => pickRoute(route)}
                      aria-label={`Search journeys from ${route.from} to ${route.to}`}
                      className={`grid h-[42px] w-[42px] shrink-0 cursor-pointer place-items-center rounded-full bg-[#0D1B2A] text-white transition-colors hover:bg-[#006D77] ${FOCUS}`}
                    >
                      <ArrowRightIcon size={20} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------- Why ------------------------------ */}
        <section id="why" className="py-16 sm:py-20 lg:py-24">
          <div className={CONTAINER}>
            <div className="mb-10 text-center sm:mb-12">
              <p className={EYEBROW}>Why RailLanka</p>
              <h2 className={H2}>Everything you need for a smooth ride</h2>
            </div>

            <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Glyph, title, body }, i) => (
                <article
                  key={title}
                  className={`rounded-3xl bg-[#F4F6FA] p-6 sm:p-8 ${
                    i === FEATURES.length - 1 ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <span className="grid h-[58px] w-[58px] place-items-center rounded-[18px] bg-[#006D77] text-white">
                    <Glyph size={28} />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold leading-7 sm:text-[22px]">
                    {title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-6 text-[#5B6B7E]">
                    {body}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-12 flex min-h-[187px] flex-col items-start justify-between gap-6 rounded-3xl bg-[linear-gradient(172deg,#006D77_0%,#0D1B2A_100%)] px-6 py-8 text-white sm:mt-16 sm:gap-8 sm:rounded-[32px] sm:p-10 lg:flex-row lg:items-center lg:px-14 lg:py-0">
              <div>
                <h2 className="text-[26px] font-extrabold leading-[34px] tracking-[-0.02em] sm:text-4xl sm:leading-[44px]">
                  Ready for your next journey?
                </h2>
                <p className="mt-3 max-w-[640px] text-base leading-6 text-white/80 sm:text-[17px]">
                  Create a free passenger account and book your first e-ticket
                  today.
                </p>
              </div>
              <Link
                to={registerTo}
                className={`${BTN} h-[55px] w-full shrink-0 rounded-2xl bg-white px-7 text-base font-bold text-[#0D1B2A] sm:w-auto`}
              >
                Create account
                <ArrowRightIcon size={20} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------------------- Footer ------------------------------ */}
      <footer className="bg-[#0B132B] pt-12 text-white sm:pt-16">
        <div className={CONTAINER}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 pb-12 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.4fr)_1fr_1fr_1fr] lg:gap-y-0 xl:grid-cols-[minmax(0,1fr)_293px_264px_158px]">
            <div className="col-span-full lg:col-span-1">
              <Brand />
              <p className="mt-[22px] max-w-[480px] text-[15px] leading-6 text-white/[0.65]">
                Sri Lanka&apos;s railway e-ticket booking platform. Search, book
                and travel with a QR ticket.
              </p>
            </div>

            {footerColumns.map((col) => (
              <nav
                key={col.title}
                aria-label={col.title}
                className={col.className}
              >
                <h4 className="mt-1 text-[15px] font-bold leading-[18px]">
                  {col.title}
                </h4>
                <ul className="mt-5 flex flex-col gap-3 leading-5">
                  {col.links.map(({ label, to: path }) => (
                    <li key={label}>
                      {path ? (
                        <Link
                          to={path}
                          className={`${FOOTER_LINK} hover:text-white`}
                        >
                          {label}
                        </Link>
                      ) : (
                        <span className={FOOTER_LINK}>{label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className={CONTAINER}>
          <div className="h-px bg-white/[0.12]" />
          <div className="flex min-h-[96px] flex-col items-start justify-center gap-4 py-6 text-[13px] text-white/[0.55] sm:flex-row sm:items-center sm:justify-between sm:py-0">
            <p>© {new Date().getFullYear()} RailLanka. All rights reserved.</p>
            <div className="flex gap-5">
              <Link to={PATHS.privacy} className="hover:text-white">
                Privacy Policy
              </Link>
              <Link to={PATHS.terms} className="hover:text-white">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PassengerDashboard;