import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    BOOKING_ROUTES,
    BankIcon,
    CardIcon,
    LockIcon,
    MailIcon,
    ShieldIcon,
    Stepper,
    TrainIcon,
    WalletIcon,
    classLabel,
    formatDate,
    formatLKR,
    loadBookingSession,
    saveBookingSession,
    totalTickets,
    ui,
} from './BookingShared';
import type { BookingSession } from './BookingShared';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const formRef = useRef<HTMLFormElement>(null);
    const [redirecting, setRedirecting] = useState(false);

    const session: BookingSession | null = (location.state as BookingSession | null) ?? loadBookingSession();


    useEffect(() => {
        const onShow = (event: PageTransitionEvent) => {
            if (event.persisted) setRedirecting(false);
        };
        window.addEventListener('pageshow', onShow);
        return () => window.removeEventListener('pageshow', onShow);
    }, []);

    if (!session) {
        return (
            <div className={ui.page}>
                <div className={`${ui.wrap} mx-auto max-w-lg pt-10 text-center`}>
                    <h1 className="text-2xl font-extrabold tracking-tight">No booking to pay for</h1>
                    <p className="mt-3 text-[15px] text-[#5B6B7E]">
                        Start a new search and choose your passengers, then you can pay here.
                    </p>
                    <Link to={BOOKING_ROUTES.search} className={`${ui.btnPrimary} mt-6`}>
                        Search trains
                    </Link>
                </div>
            </div>
        );
    }

    const { journey, checkout } = session;
    const amount = Number(checkout.checkoutData.amount);
    const hasTimes = Boolean(journey.departureTime && journey.arrivalTime);

    const handlePay = () => {
        if (redirecting) return;
        setRedirecting(true);
        saveBookingSession(session); // the success / cancel pages read this after PayHere
        formRef.current?.submit();
    };

    return (
        <div className={ui.page}>
            <div className={ui.wrap}>
                <header className={ui.head}>
                    <div>
                        <h1 className={ui.title}>Secure payment</h1>
                        <p className={ui.sub}>Review your booking and pay in Sri Lankan rupees (LKR)</p>
                    </div>
                    <Stepper current={3} />
                </header>

                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-7">
                    {/* Payment method */}
                    <section className={`${ui.card} sm:p-7`} aria-labelledby="method-title">
                        <h2 id="method-title" className={ui.cardTitle}>
                            Payment method
                        </h2>

                        <div className="flex items-center gap-4 rounded-2xl border-[1.5px] border-[#006D77] bg-[#E8F3F4] px-4 py-4 sm:px-5">
                            <span className="flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-xl bg-white px-2.5 text-[13px] font-extrabold text-[#006D77]">
                                PayHere
                            </span>
                            <div className="min-w-0">
                                <p className="text-base font-bold">Pay with PayHere</p>
                                <p className="text-[13px] text-[#5B6B7E]">
                                    Cards, mobile wallets and internet banking
                                </p>
                            </div>
                        </div>

                        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                            {[
                                { label: 'Debit / Credit card', icon: <CardIcon size={18} /> },
                                { label: 'Mobile wallet', icon: <WalletIcon size={18} /> },
                                { label: 'Internet banking', icon: <BankIcon size={18} /> },
                            ].map((m) => (
                                <li
                                    key={m.label}
                                    className="flex items-center gap-2.5 rounded-xl border border-[#E2E7EF] bg-white px-4 py-3 text-sm font-semibold"
                                >
                                    <span className="text-[#006D77]">{m.icon}</span>
                                    {m.label}
                                </li>
                            ))}
                        </ul>

                        <ol className="my-6 flex flex-col gap-3.5 text-sm text-[#5B6B7E]">
                            {[
                                'You’re taken to PayHere’s secure payment page.',
                                'Choose how you’d like to pay and confirm.',
                                'You return here and your e-ticket is ready.',
                            ].map((text, i) => (
                                <li key={text} className="flex items-start gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E8F3F4] text-xs font-bold text-[#006D77]">
                                        {i + 1}
                                    </span>
                                    <span className="pt-0.5">{text}</span>
                                </li>
                            ))}
                        </ol>

                        <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#E8F3F4] px-4 py-3.5 text-[13px] text-[#006D77]">
                            <span className="shrink-0">
                                <ShieldIcon size={18} />
                            </span>
                            Payments are processed by PayHere. Your card details are never stored by RailLanka.
                        </div>

                        {/* PayHere checkout form - posted straight to PayHere */}
                        <form ref={formRef} method="post" action={checkout.checkoutUrl}>
                            {Object.entries(checkout.checkoutData).map(([name, value]) => (
                                <input key={name} type="hidden" name={name} value={value} />
                            ))}
                        </form>

                        <button type="button" onClick={handlePay} disabled={redirecting} className={`${ui.btnPrimary} w-full`}>
                            <LockIcon size={18} />
                            {redirecting ? 'Redirecting to PayHere…' : `Pay ${formatLKR(amount)} with PayHere`}
                        </button>

                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => navigate(BOOKING_ROUTES.search)}
                                className={ui.link}
                                disabled={redirecting}
                            >
                                Change journey
                            </button>
                        </div>
                    </section>

                    {/* Order summary */}
                    <aside className="order-first min-w-0 lg:order-none lg:sticky lg:top-6" aria-label="Order summary">
                        <div className={ui.card}>
                            <h2 className="mb-5 text-lg font-bold tracking-tight">Order summary</h2>

                            <div className="mb-5 flex items-center gap-3.5 rounded-2xl bg-[#F4F6FA] px-4 py-3.5">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0D1B2A] text-white">
                                    <TrainIcon size={22} />
                                </span>
                                <div className="min-w-0">
                                    <p className="break-words text-[15px] font-bold leading-snug">
                                        {journey.startStation.name} → {journey.destinationStation.name}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#5B6B7E]">
                                        {formatDate(journey.journeyDate)}
                                        {hasTimes ? ` · ${journey.departureTime} – ${journey.arrivalTime}` : ''}
                                    </p>
                                </div>
                            </div>

                            <p className="mb-3 text-xs font-semibold text-[#5B6B7E]">Passengers</p>
                            <ul className={ui.rows}>
                                {journey.tickets.map((t) => (
                                    <li key={t.class} className="flex items-center justify-between gap-3">
                                        <span className="font-semibold">{classLabel(t.class)}</span>
                                        <span className="text-[#5B6B7E]">
                                            {t.ticketCount} {t.ticketCount === 1 ? 'passenger' : 'passengers'}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <hr className={ui.divider} />

                            <ul className={ui.rows}>
                                <li className={ui.row}>
                                    <span>Tickets</span>
                                    <b className={ui.rowValue}>{totalTickets(journey.tickets)}</b>
                                </li>
                            </ul>

                            <hr className={ui.divider} />

                            <div className="flex items-baseline justify-between gap-3">
                                <span className="text-[15px] font-bold">Total payable</span>
                                <strong className="text-3xl font-extrabold tracking-tight text-[#006D77]">
                                    {formatLKR(amount)}
                                </strong>
                            </div>

                            <p className="mt-4 flex items-center gap-2 text-xs text-[#5B6B7E]">
                                <MailIcon size={14} />
                                Your e-ticket is issued after payment is confirmed.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;