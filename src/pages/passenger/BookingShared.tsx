import type { ReactNode } from 'react';


export const BOOKING_ROUTES = {
    search: "/passenger",
    profile: "/passenger/profile",
    searchedRoutes: "/passenger/searched-routes",
    booking: "/passenger/booking",
    payment: "/passenger/payment",
    success: "/passenger/payment-success",
    cancel: "/passenger/payment-cancel",
    myTickets: "/passenger/tickets",

} as const;

export const MAX_PASSENGERS = 10;


/** Same values as the TicketClass enum in journeyModel.ts */
export const TicketClass = {
    FIRST_CLASS: 'FIRST_CLASS',
    SECOND_CLASS: 'SECOND_CLASS',
    THIRD_CLASS: 'THIRD_CLASS',
} as const;

export type TicketClass = (typeof TicketClass)[keyof typeof TicketClass];

export const TICKET_CLASSES: { value: TicketClass; label: string; note: string }[] = [
    { value: TicketClass.FIRST_CLASS, label: '1st Class', note: 'Reserved seat · A/C' },
    { value: TicketClass.SECOND_CLASS, label: '2nd Class', note: 'Reserved seat' },
    { value: TicketClass.THIRD_CLASS, label: '3rd Class', note: 'Unreserved' },
];

/** Price of ONE ticket per class for a start/destination pair. */
export type TicketPrices = Record<TicketClass, number>;

export const classLabel = (c: TicketClass): string =>
    TICKET_CLASSES.find((t) => t.value === c)?.label ?? c;

/** One entry of `tickets` in the booking request (ITicketBook). */
export type Ticket = {
    class: TicketClass;
    ticketCount: number;
};
/** GET /api/v1/stations -> body[] */
export interface StationOption {
    _id: string;
    stationName: string;
    stationCode: string;
}

/** GET /api/v1/routes/filter-routes -> body[] (routeService.getRoutesByJourney) */
export interface RouteSearchResult {
    route: {
        _id: string;
        routeName: string;
        routeCode: string;
        description?: string;
        estimatedDurationHours: number;
    };
    stations: {
        station: StationOption | null;
        arrivalTime: string; // HH:mm
        departureTime: string; // HH:mm
    }[];
    journeyDate: string;
}

/** Body of POST /api/v1/journeys (ITicketBook). `passengerId` is not here -
 *  your API layer adds it (from the token / profile). */
export interface BookingRequest {
    routeId: string;
    startStation: string; // station _id
    destinationStation: string; // station _id
    journeyDate: string; // YYYY-MM-DD
    tickets: Ticket[];
    address: string;
    city: string;
}

/** PayHere form fields built by journeyService.bookingTickets() */
export interface PayHereCheckoutData {
    merchant_id: string;
    return_url: string;
    cancel_url: string;
    notify_url: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    order_id: string;
    items: string;
    currency: string;
    amount: string; // e.g. "1900.00"
    hash: string;
}

/** `data` of the POST /api/v1/journeys response. */
export interface BookingCheckout {
    ticketId: string;
    paymentId: string;
    checkoutUrl: string;
    checkoutData: PayHereCheckoutData;
}

/** The journey the passenger picked. SearchRoutesPage puts it in the URL of
 *  BookingDetailsPage; BookingDetailsPage hands it on to PaymentPage and
 *  TicketConfirmationPage (router state + sessionStorage). */
export interface SelectedJourney {
    routeId: string;
    routeName: string;
    routeCode: string;
    startStation: { id: string; name: string };
    destinationStation: { id: string; name: string };
    journeyDate: string; // YYYY-MM-DD
    departureTime: string; // HH:mm at start station ('' if unknown)
    arrivalTime: string; // HH:mm at destination ('' if unknown)
    durationMinutes: number; // 0 if unknown
    tickets: Ticket[];
}

/** Router state sent to PaymentPage (also mirrored in sessionStorage). */
export interface BookingSession {
    journey: SelectedJourney;
    checkout: BookingCheckout;
}

/* -------------------------------------------------------------------------- */
/*  Session storage - survives the redirect to PayHere and back                */
/* -------------------------------------------------------------------------- */

const SESSION_KEY = 'raillanka.booking';

export const saveBookingSession = (session: BookingSession): void => {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
        /* storage unavailable - router state still works for the next page */
    }
};

export const loadBookingSession = (): BookingSession | null => {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? (JSON.parse(raw) as BookingSession) : null;
    } catch {
        return null;
    }
};

export const clearBookingSession = (): void => {
    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch {
        /* ignore */
    }
};

/* -------------------------------------------------------------------------- */
/*  Formatters                                                                 */
/* -------------------------------------------------------------------------- */

/** Prefers the backend's own message ({ message } in the response body) over the generic axios one. */
export const messageOf = (error: unknown): string => {
    const apiMessage = (error as { response?: { data?: { message?: unknown } } } | null)?.response?.data?.message;
    if (typeof apiMessage === 'string' && apiMessage) return apiMessage;
    return error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.';
};

export const formatLKR = (amount: number): string =>
    `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-10-31" -> "Sat, 31 Oct 2026" (parsed as a local date, no timezone shift) */
export const formatDate = (iso: string): string => {
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return iso;
    const date = new Date(y, m - 1, d);
    return `${WEEKDAYS[date.getDay()]}, ${d} ${MONTHS[m - 1]} ${y}`;
};

export const todayISO = (): string => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${mm}-${dd}`;
};

/** Minutes between two HH:mm values (handles trains that arrive after midnight). */
export const minutesBetween = (from: string, to: string): number => {
    const [fh, fm] = from.split(':').map(Number);
    const [th, tm] = to.split(':').map(Number);
    const diff = th * 60 + tm - (fh * 60 + fm);
    return diff >= 0 ? diff : diff + 24 * 60;
};

export const formatDuration = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${String(m).padStart(2, '0')}m`;
};

export const totalTickets = (tickets: Ticket[]): number =>
    tickets.reduce((sum, t) => sum + t.ticketCount, 0);

/** "2 × 2nd Class, 1 × 1st Class" */
export const ticketsSummary = (tickets: Ticket[]): string =>
    tickets.map((t) => `${t.ticketCount} × ${classLabel(t.class)}`).join(', ');

/* -------------------------------------------------------------------------- */
/*  Icons                                                                      */
/* -------------------------------------------------------------------------- */

interface IconProps {
    size?: number;
}

const Svg = ({ size = 20, children }: IconProps & { children: ReactNode }) => (
    <svg
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

export const TrainIcon = (p: IconProps) => (
    <Svg {...p}>
        <rect x="5" y="3" width="14" height="14" rx="3" />
        <path d="M5 11h14" />
        <path d="M9 14h.01M15 14h.01" />
        <path d="M8 21l2-4M16 21l-2-4" />
    </Svg>
);
export const CheckIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M20 6 9 17l-5-5" />
    </Svg>
);
export const CloseIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M18 6 6 18M6 6l12 12" />
    </Svg>
);
export const ArrowRightIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
);
export const ArrowLeftIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M19 12H5M11 6l-6 6 6 6" />
    </Svg>
);
export const SwapIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
    </Svg>
);
export const LockIcon = (p: IconProps) => (
    <Svg {...p}>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Svg>
);
export const ShieldIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
    </Svg>
);
export const MailIcon = (p: IconProps) => (
    <Svg {...p}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
    </Svg>
);
export const DownloadIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
    </Svg>
);
export const UserIcon = (p: IconProps) => (
    <Svg {...p}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </Svg>
);
export const MinusIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M5 12h14" />
    </Svg>
);
export const PlusIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M12 5v14M5 12h14" />
    </Svg>
);
export const WalletIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M4 7a2 2 0 0 1 2-2h12v4" />
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M16 13.5h2" />
    </Svg>
);
export const CardIcon = (p: IconProps) => (
    <Svg {...p}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
    </Svg>
);
export const BankIcon = (p: IconProps) => (
    <Svg {...p}>
        <path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />
    </Svg>
);

/* -------------------------------------------------------------------------- */
/*  Shared Tailwind class sets (keeps the three pages consistent)              */
/* -------------------------------------------------------------------------- */

export const ui = {
    page: 'min-h-full bg-[#F4F6FA] px-4 py-6 text-[#0D1B2A] sm:px-6 sm:py-8 lg:px-10 lg:py-10',
    wrap: 'mx-auto w-full max-w-[1280px]',
    head: 'mb-6 flex flex-col gap-5 sm:mb-8 lg:flex-row lg:items-start lg:justify-between',
    title: 'text-2xl font-extrabold tracking-tight sm:text-3xl',
    sub: 'mt-1.5 text-sm text-[#5B6B7E] sm:text-[15px]',
    card: 'rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(13,27,42,0.04),0_10px_30px_rgba(13,27,42,0.05)] sm:p-6',
    cardTitle: 'mb-4 text-lg font-bold tracking-tight',
    label: 'mb-2 block text-[13px] font-semibold',
    field:
        'h-[52px] w-full rounded-2xl border border-[#E2E7EF] bg-white px-4 text-base text-[#0D1B2A] sm:text-[15px] placeholder:text-[#9AA7B6] focus:border-[#006D77] focus:outline-none focus:ring-2 focus:ring-[#7FD6DC]/60',
    btnPrimary:
        'inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl bg-[#006D77] px-6 py-3 text-center text-[15px] font-semibold leading-snug text-white shadow-[0_10px_24px_rgba(0,109,119,0.28)] transition hover:bg-[#005b64] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7FD6DC] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
    btnGhost:
        'inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl border border-[#E2E7EF] bg-white px-6 py-3 text-center text-[15px] font-semibold leading-snug text-[#0D1B2A] transition hover:border-[#C9D2E0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7FD6DC] disabled:cursor-not-allowed disabled:opacity-50',
    link: 'inline-flex items-center gap-2 text-sm font-semibold text-[#006D77] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7FD6DC] rounded',
    banner:
        'rounded-3xl bg-[linear-gradient(100deg,#0D1B2A_0%,#1E3A8A_100%)] p-5 text-white sm:px-7 sm:py-6',
    divider: 'my-5 h-px w-full border-0 bg-[#E2E7EF]',
    rows: 'flex flex-col gap-3 text-sm',
    row: 'flex items-start justify-between gap-3 text-[#5B6B7E]',
    rowValue: 'break-words text-right font-bold text-[#0D1B2A]',
} as const;

export const Spinner = () => (
    <div
        role="status"
        aria-label="Loading"
        className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-[#E2E7EF] border-t-[#006D77] motion-reduce:animate-[spin_2.4s_linear_infinite]"
    />
);

/* -------------------------------------------------------------------------- */
/*  Step indicator                                                             */
/* -------------------------------------------------------------------------- */

export const BOOKING_STEPS = ['Journey', 'Passengers', 'Payment', 'E-ticket'] as const;

/** current: 1 Journey · 2 Passengers · 3 Payment · 4 E-ticket · 5 = all done */
export const Stepper = ({ current }: { current: 1 | 2 | 3 | 4 | 5 }) => (
    <ol className="flex flex-wrap items-center gap-y-2" aria-label="Booking progress">
        {BOOKING_STEPS.map((label, index) => {
            const n = index + 1;
            const state = n < current ? 'done' : n === current ? 'current' : 'todo';
            const dot =
                state === 'done'
                    ? 'border-[#006D77] bg-[#006D77] text-white'
                    : state === 'current'
                      ? 'border-[#0D1B2A] bg-[#0D1B2A] text-white'
                      : 'border-[#C9D2E0] bg-white text-[#5B6B7E]';
            const text =
                state === 'done'
                    ? 'font-semibold text-[#006D77]'
                    : state === 'current'
                      ? 'font-bold text-[#0D1B2A]'
                      : 'text-[#5B6B7E]';
            return (
                <li key={label} className="flex items-center" aria-current={state === 'current' ? 'step' : undefined}>
                    <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full border text-[13px] font-bold ${dot}`}
                    >
                        {state === 'done' ? <CheckIcon size={14} /> : n}
                    </span>
                    <span className={`ml-2.5 text-sm ${text} ${state === 'current' ? 'inline' : 'hidden md:inline'}`}>
                        {label}
                    </span>
                    {n < BOOKING_STEPS.length && (
                        <span
                            aria-hidden="true"
                            className={`mx-2 h-0.5 w-4 sm:mx-3 sm:w-9 ${state === 'done' ? 'bg-[#006D77]' : 'bg-[#E2E7EF]'}`}
                        />
                    )}
                </li>
            );
        })}
    </ol>
);