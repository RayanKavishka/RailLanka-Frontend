import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ArrowRightIcon,
    BOOKING_ROUTES,
    LockIcon,
    MAX_PASSENGERS,
    Stepper,
    TICKET_CLASSES,
    TicketClass,
    TrainIcon,
    classLabel,
    formatDate,
    formatDuration,
    formatLKR,
    messageOf,
    minutesBetween,
    saveBookingSession,
    ui,
} from './BookingShared';
import type { BookingSession, SelectedJourney, Ticket, TicketPrices } from './BookingShared';
import { bookTickets, getTicketPrices } from '../../services/journeyService';

type TicketCounts = Record<TicketClass, number>;

const EMPTY_COUNTS: TicketCounts = {
    [TicketClass.FIRST_CLASS]: 0,
    [TicketClass.SECOND_CLASS]: 0,
    [TicketClass.THIRD_CLASS]: 0,
};

const BookingDetailsPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    /* Journey chosen on SearchedRoutesPage */
    const routeId = searchParams.get('routeId') ?? '';
    const startStation = searchParams.get('startStation') ?? '';
    const destinationStation = searchParams.get('destinationStation') ?? '';
    const journeyDate = searchParams.get('journeyDate') ?? '';
    const startStationId = searchParams.get('startStationId') ?? '';
    const destinationStationId = searchParams.get('destinationStationId') ?? '';
    const departureTime = searchParams.get('departureTime') ?? '';
    const arrivalTime = searchParams.get('arrivalTime') ?? '';
    const routeName = searchParams.get('routeName') ?? '';
    const routeCode = searchParams.get('routeCode') ?? '';

    const hasJourney = [routeId, startStation, destinationStation, journeyDate, startStationId, destinationStationId].every(
        Boolean,
    );
    const hasTimes = Boolean(departureTime && arrivalTime);
    const durationMinutes = hasTimes ? minutesBetween(departureTime, arrivalTime) : 0;

    const [ticketCounts, setTicketCounts] = useState<TicketCounts>(EMPTY_COUNTS);
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');

    const [ticketPrices, setTicketPrices] = useState<TicketPrices | null>(null);
    const [pricesLoading, setPricesLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!startStationId || !destinationStationId) return;
        let ignore = false;

        const callTicketPricesAPI = async () => {
            try {
                const res = await getTicketPrices({ startStationId, destinationStationId });
                const { firstClsTicketPrice, secondClsTicketPrice, thirdClsTicketPrice } = res.data.body;

                if (!ignore) {
                    setTicketPrices({
                        [TicketClass.FIRST_CLASS]: firstClsTicketPrice,
                        [TicketClass.SECOND_CLASS]: secondClsTicketPrice,
                        [TicketClass.THIRD_CLASS]: thirdClsTicketPrice,
                    });
                }
            } catch (error) {
                console.error('Ticket prices loading failed.', error);
                if (!ignore) toast.error('Could not load ticket prices.');
            } finally {
                if (!ignore) setPricesLoading(false);
            }
        };

        callTicketPricesAPI();
        return () => {
            ignore = true;
        };
    }, [startStationId, destinationStationId]);

    const totalPassengers = TICKET_CLASSES.reduce((sum, c) => sum + ticketCounts[c.value], 0);
    const selectedClasses = TICKET_CLASSES.filter((c) => ticketCounts[c.value] > 0);
    const total = ticketPrices
        ? selectedClasses.reduce((sum, c) => sum + ticketCounts[c.value] * ticketPrices[c.value], 0)
        : null;

    const handleCountChange = (ticketClass: TicketClass, value: string) => {
        setTicketCounts((prev) => ({ ...prev, [ticketClass]: Number(value) }));
    };

    const handleContinuePayment = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submitting) return;

        if (totalPassengers === 0) {
            toast.error('Select at least one passenger.');
            return;
        }
        if (!address.trim() || !city.trim()) {
            toast.error('Enter your address and city to continue.');
            return;
        }

        const tickets: Ticket[] = selectedClasses.map((c) => ({
            class: c.value,
            ticketCount: ticketCounts[c.value],
        }));

        setSubmitting(true);
        try {
            const res = await bookTickets({
                routeId,
                startStation: startStationId,
                destinationStation: destinationStationId,
                journeyDate,
                tickets,
                address: address.trim(),
                city: city.trim(),
            });

            const checkout = res.data.data;

            const journey: SelectedJourney = {
                routeId,
                routeName,
                routeCode,
                startStation: { id: startStationId, name: startStation },
                destinationStation: { id: destinationStationId, name: destinationStation },
                journeyDate,
                departureTime,
                arrivalTime,
                durationMinutes,
                tickets,
            };
            const session: BookingSession = { journey, checkout };

            saveBookingSession(session);
            navigate(BOOKING_ROUTES.payment, { state: session, replace: true });

        } catch (error) {
            console.error('Booking failed.', error);
            toast.error(messageOf(error));

        } finally {
            setSubmitting(false);
        }
    };

    if (!hasJourney) {
        return (
            <div className={ui.page}>
                <div className={`${ui.wrap} mx-auto max-w-lg pt-10 text-center`}>
                    <h1 className="text-2xl font-extrabold tracking-tight">No journey selected</h1>
                    <p className="mt-3 text-[15px] text-[#5B6B7E]">
                        Pick a train from the search results first, then come back here to choose your passengers.
                    </p>
                    <Link to={BOOKING_ROUTES.search} className={`${ui.btnPrimary} mt-6`}>
                        Search trains
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={ui.page}>
            <div className={ui.wrap}>
                <header className={ui.head}>
                    <div>
                        <h1 className={ui.title}>Select passengers</h1>
                        <p className={ui.sub}>
                            Complete your booking for {startStation} → {destinationStation}
                        </p>
                    </div>
                    <Stepper current={2} />
                </header>

                <form
                    onSubmit={handleContinuePayment}
                    className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-7"
                    noValidate
                >
                    <div className="flex min-w-0 flex-col gap-6">
                        {/* Journey banner */}
                        <section className={ui.banner} aria-label="Selected journey">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                                    <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#7FD6DC] sm:inline-flex">
                                        <TrainIcon size={22} />
                                    </span>
                                    {hasTimes ? (
                                        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                                            <div className="min-w-0">
                                                <p className="text-2xl font-extrabold leading-none tracking-tight">
                                                    {departureTime}
                                                </p>
                                                <p className="mt-1.5 break-words text-[13px] text-white/70">{startStation}</p>
                                            </div>
                                            <span className="shrink-0 text-[#7FD6DC]">
                                                <ArrowRightIcon size={18} />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-2xl font-extrabold leading-none tracking-tight">
                                                    {arrivalTime}
                                                </p>
                                                <p className="mt-1.5 break-words text-[13px] text-white/70">{destinationStation}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xl font-extrabold tracking-tight">
                                            {startStation} → {destinationStation}
                                        </p>
                                    )}
                                </div>

                                <div className="text-sm sm:text-right">
                                    {(routeName || routeCode) && (
                                        <p className="font-bold">
                                            {routeName}
                                            {routeName && routeCode ? ' · ' : ''}
                                            {routeCode}
                                        </p>
                                    )}
                                    <p className="mt-1 text-white/70">
                                        {formatDate(journeyDate)}
                                        {hasTimes ? ` · ${formatDuration(durationMinutes)}` : ''}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Passengers per class */}
                        <section className={ui.card} aria-labelledby="classes-title">
                            <h2 id="classes-title" className={ui.cardTitle}>
                                Passengers in each class
                            </h2>

                            <div className="grid gap-4 sm:grid-cols-3">
                                {TICKET_CLASSES.map((c) => {
                                    const count = ticketCounts[c.value];
                                    const active = count > 0;
                                    const price = ticketPrices?.[c.value];
                                    const max = Math.max(count, MAX_PASSENGERS - (totalPassengers - count));

                                    return (
                                        <div
                                            key={c.value}
                                            className={`flex flex-col rounded-2xl border-[1.5px] p-4 transition-colors sm:p-[18px] ${
                                                active ? 'border-[#006D77] bg-[#E8F3F4]' : 'border-[#E2E7EF] bg-white'
                                            }`}
                                        >
                                            <h3 className="text-[15px] font-bold">{c.label}</h3>
                                            <p
                                                className={`mt-1 font-extrabold tracking-tight ${
                                                    price !== undefined
                                                        ? `text-[22px] ${active ? 'text-[#006D77]' : ''}`
                                                        : 'py-1 text-sm font-semibold text-[#5B6B7E]'
                                                }`}
                                            >
                                                {price !== undefined
                                                    ? formatLKR(price)
                                                    : pricesLoading
                                                      ? 'Loading price…'
                                                      : 'Price unavailable'}
                                            </p>
                                            <p className="text-[13px] text-[#5B6B7E]">
                                                {c.note}
                                                {price !== undefined ? ' · per passenger' : ''}
                                            </p>

                                            <label htmlFor={`count-${c.value}`} className="mb-1.5 mt-4 text-[13px] font-semibold">
                                                Passengers
                                            </label>
                                            <select
                                                id={`count-${c.value}`}
                                                className="h-11 w-full rounded-xl border border-[#E2E7EF] bg-white px-3 text-base focus:border-[#006D77] sm:text-[15px] focus:outline-none focus:ring-2 focus:ring-[#7FD6DC]/60"
                                                value={count}
                                                onChange={(e) => handleCountChange(c.value, e.target.value)}
                                            >
                                                {Array.from({ length: max + 1 }, (_, n) => (
                                                    <option key={n} value={n}>
                                                        {n === 0 ? 'None' : n}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="mt-4 text-[13px] text-[#5B6B7E]">
                                Up to {MAX_PASSENGERS} passengers per booking. Choose “None” for classes you don’t need.
                            </p>
                        </section>

                        {/* Address + city (needed by PayHere) */}
                        <section className={ui.card} aria-labelledby="address-title">
                            <h2 id="address-title" className={ui.cardTitle}>
                                Your address
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="address" className={ui.label}>
                                        Address
                                    </label>
                                    <input
                                        id="address"
                                        className={ui.field}
                                        autoComplete="street-address"
                                        placeholder="House no, street"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="city" className={ui.label}>
                                        City
                                    </label>
                                    <input
                                        id="city"
                                        className={ui.field}
                                        autoComplete="address-level2"
                                        placeholder="e.g. Colombo"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>
                            </div>
                            <p className="mt-4 text-[13px] text-[#5B6B7E]">
                                Shared with PayHere to process your payment.
                            </p>
                        </section>
                    </div>

                    {/* Booking summary */}
                    <aside className="min-w-0 lg:sticky lg:top-6" aria-label="Booking summary">
                        <div className={ui.card}>
                            <h2 className="mb-5 text-lg font-bold tracking-tight">Booking summary</h2>

                            <p className="break-words text-[15px] font-bold">
                                {startStation} → {destinationStation}
                            </p>
                            <p className="mt-1 text-[13px] text-[#5B6B7E]">
                                {formatDate(journeyDate)}
                                {hasTimes ? ` · ${departureTime} – ${arrivalTime}` : ''}
                            </p>

                            <hr className={ui.divider} />

                            {totalPassengers === 0 ? (
                                <p className="text-sm text-[#5B6B7E]">No passengers selected yet.</p>
                            ) : (
                                <ul className={ui.rows}>
                                    {selectedClasses.map((c) => {
                                        const price = ticketPrices?.[c.value];
                                        return (
                                            <li key={c.value} className={ui.row}>
                                                <span>
                                                    {classLabel(c.value)} × {ticketCounts[c.value]}
                                                </span>
                                                <b className={ui.rowValue}>
                                                    {price !== undefined ? formatLKR(price * ticketCounts[c.value]) : '—'}
                                                </b>
                                            </li>
                                        );
                                    })}
                                    <li className={ui.row}>
                                        <span>Passengers</span>
                                        <b className={ui.rowValue}>{totalPassengers}</b>
                                    </li>
                                </ul>
                            )}

                            <hr className={ui.divider} />

                            <div className="mb-5 flex items-baseline justify-between gap-3">
                                <span className="text-[15px] font-bold">Total</span>
                                {total !== null && totalPassengers > 0 ? (
                                    <strong className="text-3xl font-extrabold tracking-tight text-[#006D77]">
                                        {formatLKR(total)}
                                    </strong>
                                ) : (
                                    <span className="text-sm font-semibold text-[#5B6B7E]">
                                        {totalPassengers === 0 ? '—' : 'Shown at payment'}
                                    </span>
                                )}
                            </div>

                            <button type="submit" disabled={submitting || totalPassengers === 0} className={`${ui.btnPrimary} w-full`}>
                                {submitting ? 'Preparing payment…' : 'Continue to Payment'}
                                {!submitting && <ArrowRightIcon size={18} />}
                            </button>

                            <p className="mt-3.5 flex items-center justify-center gap-2 text-center text-xs text-[#5B6B7E]">
                                <LockIcon size={14} />
                                You’ll review the final fare before you pay.
                            </p>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
};

export default BookingDetailsPage;