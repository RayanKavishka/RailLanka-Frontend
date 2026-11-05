import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowRightIcon,
    BOOKING_ROUTES,
    CheckIcon,
    CloseIcon,
    DownloadIcon,
    MailIcon,
    Spinner,
    TrainIcon,
    clearBookingSession,
    formatDate,
    formatDuration,
    formatLKR,
    loadBookingSession,
    messageOf,
    ticketsSummary,
    ui,
} from './BookingShared';
import { fetchTicketConfirmation } from '../../services/paymentService';


export interface TicketConfirmation {
    ticketId: string;
    paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
    amount: number;
    passengerName: string;
    passengerEmail: string;
    qrImage?: string; // data URL ("data:image/png;base64,...") - may be missing right after payment
    qrStatus?: 'ACTIVE' | 'USED' | 'EXPIRED';
}

const Shell = ({ children }: { children: ReactNode }) => (
    <div className={`${ui.page} print:bg-white print:p-0`}>
        <div className={`${ui.wrap} print:max-w-none`}>{children}</div>
    </div>
);

const POLL_EVERY_MS = 3000;
const MAX_POLLS = 20; // ~1 minute

const QR_STATUS = {
    ACTIVE: { label: 'Valid', ok: true },
    USED: { label: 'Used', ok: false },
    EXPIRED: { label: 'Expired', ok: false },
} as const;

/**
 * Route this component at BOOKING_ROUTES.success (PayHere return_url) and
 * render <TicketConfirmationPage cancelled /> at BOOKING_ROUTES.cancel.
 */
const TicketConfirmationPage = ({ cancelled = false }: { cancelled?: boolean }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [session] = useState(loadBookingSession);

    const paymentId = searchParams.get('order_id') ?? session?.checkout.paymentId ?? null;
    const journey = session && session.checkout.paymentId === paymentId ? session.journey : null;

    const [data, setData] = useState<TicketConfirmation | null>(null);
    const [error, setError] = useState('');
    const [timedOut, setTimedOut] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    /* Poll until the payment is confirmed and the QR exists */
    useEffect(() => {
        if (!paymentId || cancelled) return;

        let ignore = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        let polls = 0;

        setError('');
        setTimedOut(false);

        const check = async () => {
            try {
                const result = await fetchTicketConfirmation(paymentId);
                if (ignore) return;
                setData(result);

                const waiting =
                    result.paymentStatus === 'PENDING' || (result.paymentStatus === 'PAID' && !result.qrImage);
                if (!waiting) return;

                polls += 1;
                if (polls >= MAX_POLLS) {
                    setTimedOut(true);
                    return;
                }
                timer = setTimeout(check, POLL_EVERY_MS);
            } catch (e) {
                console.error('Ticket confirmation failed.', e);
                if (!ignore) setError(messageOf(e));
            }
        };

        check();
        return () => {
            ignore = true;
            if (timer) clearTimeout(timer);
        };
    }, [paymentId, cancelled, reloadKey]);

    const goToMyTickets = () => {
        clearBookingSession();
        navigate(BOOKING_ROUTES.myTickets);
    };

    /* ---------- simple full-page states ---------- */

    if (!paymentId) {
        return (
            <Shell>
                <div className="mx-auto mt-6 max-w-lg text-center sm:mt-12">
                    <h1 className="text-2xl font-extrabold tracking-tight">We couldn’t find this booking</h1>
                    <p className="mt-3 text-[15px] text-[#5B6B7E]">
                        If you already paid, your e-ticket is in My Tickets and in your inbox.
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        <button type="button" onClick={goToMyTickets} className={ui.btnPrimary}>
                            View My Tickets
                        </button>
                        <Link to={BOOKING_ROUTES.search} className={ui.btnGhost}>
                            Search trains
                        </Link>
                    </div>
                </div>
            </Shell>
        );
    }

    if (cancelled || data?.paymentStatus === 'CANCELLED') {
        return (
            <Shell>
                <div className="mx-auto mt-6 max-w-lg text-center sm:mt-12">
                    <div className="mx-auto mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#FDECEA]">
                        <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#B42318] text-white">
                            <CloseIcon size={26} />
                        </span>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Payment cancelled</h1>
                    <p className="mt-3 text-[15px] text-[#5B6B7E]">
                        Your payment was not completed and you haven’t been charged.
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        {session && (
                            <button
                                type="button"
                                onClick={() => navigate(BOOKING_ROUTES.payment, { state: session })}
                                className={ui.btnPrimary}
                            >
                                Try payment again
                            </button>
                        )}
                        <Link to={BOOKING_ROUTES.search} className={ui.btnGhost}>
                            Search trains
                        </Link>
                    </div>
                </div>
            </Shell>
        );
    }

    if (error) {
        return (
            <Shell>
                <div className="mx-auto mt-6 max-w-lg text-center sm:mt-12">
                    <h1 className="text-2xl font-extrabold tracking-tight">We couldn’t load your ticket</h1>
                    <p className="mt-3 text-[15px] text-[#5B6B7E]">{error}</p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        <button type="button" onClick={() => setReloadKey((k) => k + 1)} className={ui.btnPrimary}>
                            Try again
                        </button>
                        <button type="button" onClick={goToMyTickets} className={ui.btnGhost}>
                            View My Tickets
                        </button>
                    </div>
                </div>
            </Shell>
        );
    }

    if (!data || data.paymentStatus === 'PENDING') {
        return (
            <Shell>
                <div className="mx-auto mt-6 max-w-lg text-center sm:mt-12">
                    {timedOut ? (
                        <>
                            <h1 className="text-2xl font-extrabold tracking-tight">Still confirming your payment</h1>
                            <p className="mt-3 text-[15px] text-[#5B6B7E]">
                                This is taking longer than usual. Your e-ticket will be e-mailed as soon as the payment
                                clears, and it will appear in My Tickets.
                            </p>
                            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                                <button type="button" onClick={() => setReloadKey((k) => k + 1)} className={ui.btnPrimary}>
                                    Check again
                                </button>
                                <button type="button" onClick={goToMyTickets} className={ui.btnGhost}>
                                    View My Tickets
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Spinner />
                            <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Confirming your payment…</h1>
                            <p className="mt-3 text-[15px] text-[#5B6B7E]">
                                This usually takes a few seconds. Please keep this page open.
                            </p>
                        </>
                    )}
                </div>
            </Shell>
        );
    }

    /* ---------- confirmed ---------- */

    const status = data.qrImage ? QR_STATUS[data.qrStatus ?? 'ACTIVE'] : { label: 'Issuing', ok: true };
    const hasTimes = Boolean(journey?.departureTime && journey?.arrivalTime);

    const details: { label: string; value: ReactNode }[] = [
        { label: 'Passenger', value: data.passengerName },
        ...(journey
            ? [
                  { label: 'Travel date', value: formatDate(journey.journeyDate) },
                  { label: 'Tickets', value: ticketsSummary(journey.tickets) },
                  {
                      label: 'Route',
                      value: [journey.routeName, journey.routeCode].filter(Boolean).join(' · ') || '—',
                  },
              ]
            : []),
        { label: 'Fare', value: formatLKR(data.amount) },
        {
            label: 'Status',
            value: (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        status.ok ? 'bg-[#DCE6E0] text-[#1B4332]' : 'bg-[#FDECEA] text-[#B42318]'
                    }`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {status.label}
                </span>
            ),
        },
    ];

    return (
        <Shell>
            <div className="mx-auto max-w-[1040px]">
                <div className="text-center print:hidden">
                    <div className="mx-auto mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#D5E1DA]">
                        <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#1B4332] text-white">
                            <CheckIcon size={26} />
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Booking confirmed!</h1>
                    <p className="mt-3 text-[15px] text-[#5B6B7E] sm:text-base">
                        Your e-ticket is ready. A copy is also being sent to{' '}
                        <span className="break-all">{data.passengerEmail}</span>.
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#DCE6E0] px-3.5 py-1.5 text-xs font-bold text-[#1B4332]">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        Payment confirmed · {formatLKR(data.amount)}
                    </span>
                </div>

                {/* Ticket */}
                <article
                    className="mt-8 grid overflow-hidden rounded-[28px] bg-white text-left shadow-[0_20px_50px_rgba(13,27,42,0.12)] print:mt-0 print:shadow-none md:mt-10 md:grid-cols-[minmax(0,1fr)_300px]"
                    aria-label="E-ticket"
                >
                    <div className="border-b-2 border-dashed border-[#C9D2E0] md:border-b-0 md:border-r-2">
                        <div className="flex items-center justify-between gap-4 bg-[linear-gradient(100deg,#0D1B2A_0%,#1E3A8A_100%)] px-5 py-4 text-white sm:px-7 sm:py-5">
                            <div className="flex items-center gap-3 text-lg font-extrabold tracking-tight sm:text-xl">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006D77]">
                                    <TrainIcon size={22} />
                                </span>
                                RailLanka
                            </div>
                            <div className="text-right text-[11px] font-semibold text-white/70">
                                Booking ref
                                <b className="mt-0.5 block text-base tracking-wider text-white">
                                    {data.ticketId.slice(-8).toUpperCase()}
                                </b>
                            </div>
                        </div>

                        {journey && (
                            <div className="flex items-center justify-between gap-4 border-b border-[#E2E7EF] px-5 py-6 sm:gap-6 sm:px-7 sm:py-8">
                                <div className="min-w-0">
                                    {hasTimes && (
                                        <p className="text-2xl font-extrabold leading-none tracking-tight sm:text-4xl lg:text-[44px]">
                                            {journey.departureTime}
                                        </p>
                                    )}
                                    <p className="mt-2 text-sm text-[#5B6B7E] sm:text-[15px]">{journey.startStation.name}</p>
                                </div>

                                <div className="min-w-[40px] flex-1 text-center sm:min-w-[56px] text-xs text-[#5B6B7E]">
                                    <div className="relative mx-1 mb-2.5 h-0.5 bg-[#006D77]/60 before:absolute before:-left-1 before:-top-[3px] before:h-2 before:w-2 before:rounded-full before:bg-[#006D77] after:absolute after:-right-1 after:-top-[3px] after:h-2 after:w-2 after:rounded-full after:bg-[#006D77]" />
                                    {journey.durationMinutes > 0 && formatDuration(journey.durationMinutes)}
                                </div>

                                <div className="min-w-0 text-right">
                                    {hasTimes && (
                                        <p className="text-2xl font-extrabold leading-none tracking-tight sm:text-4xl lg:text-[44px]">
                                            {journey.arrivalTime}
                                        </p>
                                    )}
                                    <p className="mt-2 text-sm text-[#5B6B7E] sm:text-[15px]">
                                        {journey.destinationStation.name}
                                    </p>
                                </div>
                            </div>
                        )}

                        <dl className="grid grid-cols-2 gap-x-5 gap-y-5 px-5 py-6 sm:grid-cols-3 sm:px-7 sm:pb-8">
                            {details.map((d) => (
                                <div key={d.label} className="min-w-0">
                                    <dt className="mb-1.5 text-[11px] font-semibold text-[#5B6B7E]">{d.label}</dt>
                                    <dd className="break-words text-[15px] font-bold">{d.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* QR */}
                    <div className="relative flex flex-col items-center justify-center gap-1.5 bg-[#F4F6FA] px-6 py-7 text-center">
                        <span aria-hidden="true" className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#F4F6FA] print:hidden" />
                        <span
                            aria-hidden="true"
                            className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-[#F4F6FA] print:hidden md:-bottom-3 md:-left-3 md:right-auto md:top-auto"
                        />

                        <div className="mb-3 flex h-[226px] w-[226px] items-center justify-center rounded-[20px] bg-white p-3 text-[13px] text-[#5B6B7E] shadow-[0_6px_18px_rgba(13,27,42,0.08)]">
                            {data.qrImage ? (
                                <img src={data.qrImage} alt="Ticket QR code" className="h-full w-full object-contain" />
                            ) : (
                                <span>Generating your QR code…</span>
                            )}
                        </div>
                        <strong className="text-[15px]">Scan at the platform</strong>
                        <p className="text-xs leading-relaxed text-[#5B6B7E]">
                            Show this QR code to the ticket inspector. It can only be used once.
                        </p>
                    </div>
                </article>

                <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center print:hidden">
                    <button type="button" onClick={() => window.print()} className={ui.btnPrimary}>
                        <DownloadIcon size={18} />
                        Download Ticket
                    </button>
                    <button type="button" onClick={goToMyTickets} className={ui.btnGhost}>
                        View My Tickets
                        <ArrowRightIcon size={18} />
                    </button>
                </div>

                <p className="mx-auto mt-7 flex w-fit max-w-full items-start gap-2.5 rounded-xl border border-[#E2E7EF] bg-white px-5 py-3 text-left text-[13px] text-[#5B6B7E] print:hidden">
                    <span className="mt-0.5 shrink-0 text-[#006D77]">
                        <MailIcon size={16} />
                    </span>
                    Your ticket confirmation is also sent by e-mail when delivery succeeds. You can always find it under My
                    Tickets.
                </p>
            </div>
        </Shell>
    );
};

export default TicketConfirmationPage;