import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import useAuthContext from "../hooks/useAuth";

/* -------------------------------------------------------------------------- */
/*  App paths                                                                  */
/* -------------------------------------------------------------------------- */

const PATHS = {
    home: "/passenger",
    tickets: "/passenger/tickets",
    ai: "/passenger/ai-assistant",
    profile: "/passenger/profile",
    login: "/login",
    register: "/register",
    help: "/help",
    privacy: "/privacy",
    terms: "/terms",
} as const;

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface IconProps {
    size?: number;
    className?: string;
}

interface FooterLink {
    label: string;
    to?: string;
}

interface FooterColumn {
    title: string;
    className?: string;
    links: FooterLink[];
}

/* -------------------------------------------------------------------------- */
/*  Icons                                                                      */
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
/*  Shared class names                                                         */
/* -------------------------------------------------------------------------- */

const FOCUS =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#7FD6DC]";

const CONTAINER = "mx-auto w-full max-w-[1440px] px-5 sm:px-10 lg:px-20";

const FOOTER_LINK =
    "break-words text-sm leading-5 text-white/[0.65] sm:whitespace-nowrap";

/* -------------------------------------------------------------------------- */
/*  Content                                                                    */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
    { label: "Home", to: PATHS.home, end: true },
    { label: "My Tickets", to: PATHS.tickets, end: false },
    { label: "AI Assistant", to: PATHS.ai, end: false },
];

const FOOTER_COLUMNS: FooterColumn[] = [
    {
        title: "Quick links",
        links: [
            { label: "Home", to: PATHS.home },
            { label: "My Tickets", to: PATHS.tickets },
        ],
    },
    {
        title: "Account",
        links: [
            { label: "Login", to: PATHS.login },
            { label: "Register", to: PATHS.register },
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
/*  Helpers & small building blocks                                            */
/* -------------------------------------------------------------------------- */

const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (!words.length) return "?";

    const first = words[0][0];
    const last = words.length > 1 ? words[words.length - 1][0] : "";

    return (first + last).toUpperCase();
};

const Avatar = ({
    name,
    className = "",
}: {
    name: string;
    className?: string;
}) => (
    <span
        aria-hidden="true"
        className={`grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-[#006D77] text-base font-bold text-white ${className}`}
    >
        {getInitials(name)}
    </span>
);

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

/* -------------------------------------------------------------------------- */
/*  Layout                                                                     */
/* -------------------------------------------------------------------------- */

const PassengerLayout = () => {
    const menuId = useId();
    const navRef = useRef<HTMLElement>(null);
    const { pathname } = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const { user } = useAuthContext();
    const USER_NAME: string = user?.fullName ?? "";

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

    return (
        <div className="flex min-h-screen flex-col bg-white text-[#0D1B2A] antialiased [font-family:'Plus_Jakarta_Sans',Inter,system-ui,-apple-system,'Segoe_UI',Roboto,sans-serif]">

            {/* ---------------------------- Navigation ---------------------------- */}

            <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0D1B2A] text-white">
                <div className={CONTAINER}>
                    <nav
                        ref={navRef}
                        aria-label="Primary"
                        className="relative flex h-[72px] items-center justify-between gap-4 md:h-[80px]"
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

                        {/* Tablet: avatar only. Laptop: name + avatar. */}

                        <NavLink
                            to={PATHS.profile}
                            aria-label={`${USER_NAME} – my profile`}
                            title={USER_NAME}
                            className={`hidden shrink-0 items-center gap-3.5 rounded-full transition-opacity hover:opacity-90 md:flex ${FOCUS}`}
                        >
                            {({ isActive }) => (
                                <>
                                    <span className="hidden max-w-[180px] truncate text-[15px] font-semibold text-white lg:block">
                                        {USER_NAME}
                                    </span>

                                    <Avatar
                                        name={USER_NAME}
                                        className={
                                            isActive
                                                ? "ring-2 ring-[#7FD6DC] ring-offset-2 ring-offset-[#0D1B2A]"
                                                : ""
                                        }
                                    />
                                </>
                            )}
                        </NavLink>

                        {/* Mobile: burger */}

                        <button
                            type="button"
                            onClick={() => setMenuOpen((o) => !o)}
                            aria-expanded={menuOpen}
                            aria-controls={menuId}
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                            className={`grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-white/25 text-white transition-colors hover:bg-white/10 md:hidden ${FOCUS}`}
                        >
                            {menuOpen ? (
                                <CloseIcon size={22} />
                            ) : (
                                <MenuIcon size={22} />
                            )}
                        </button>

                        {menuOpen && (
                            <div
                                id={menuId}
                                className="absolute inset-x-0 top-full z-30 mt-1 md:hidden"
                            >
                                <ul className="flex flex-col gap-1 rounded-2xl border border-white/15 bg-[#0D1B2A] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                                    <li>
                                        <NavLink
                                            to={PATHS.profile}
                                            onClick={() => setMenuOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3.5 rounded-xl p-2 transition-colors hover:bg-white/10 ${FOCUS} ${
                                                    isActive ? "bg-white/10" : ""
                                                }`
                                            }
                                        >
                                            <Avatar name={USER_NAME} />

                                            <span className="flex min-w-0 flex-col">
                                                <span className="truncate text-[15px] font-semibold text-white">
                                                    {USER_NAME}
                                                </span>
                                                <span className="text-xs text-white/60">
                                                    View profile
                                                </span>
                                            </span>
                                        </NavLink>
                                    </li>

                                    <li
                                        role="separator"
                                        aria-hidden="true"
                                        className="mx-2 my-1 h-px bg-white/[0.12]"
                                    />

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
                </div>
            </div>

            {/* ------------------------------ Page ------------------------------- */}

            <main className="flex-1">
                <Outlet />
            </main>

            {/* ------------------------------ Footer ----------------------------- */}

            <footer className="bg-[#0B132B] pt-12 text-white sm:pt-16">
                <div className={CONTAINER}>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 pb-12 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.4fr)_1fr_1fr_1fr] lg:gap-y-0 xl:grid-cols-[minmax(0,1fr)_293px_264px_158px]">
                        <div className="col-span-full lg:col-span-1">
                            <Brand />

                            <p className="mt-[22px] max-w-[480px] text-[15px] leading-6 text-white/[0.65]">
                                Sri Lanka&apos;s railway e-ticket booking platform.
                                Search, book and travel with a QR ticket.
                            </p>
                        </div>

                        {FOOTER_COLUMNS.map((col) => (
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
                                                <span className={FOOTER_LINK}>
                                                    {label}
                                                </span>
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
                        <p>
                            © {new Date().getFullYear()} RailLanka. All rights
                            reserved.
                        </p>

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



export default PassengerLayout;