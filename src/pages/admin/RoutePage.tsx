import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import axios from "axios";
import { toast } from "sonner";
import {
  addRoute,
  getAllRoutes,
  getAllStations,
  inactivateRoute,
  updateRoute,
  type RouteRecord,
  type RouteRequest,
  type RouteStop,
  type StationOption,
} from "../../services/routeService";

/* -------------------------------------------------------------------------- */
/*  Style tokens                                                               */
/* -------------------------------------------------------------------------- */

const CARD =
  "rounded-3xl bg-white shadow-[0_1px_2px_rgba(13,27,42,0.04),0_10px_28px_rgba(13,27,42,0.05)]";
const INPUT =
  "h-12 w-full rounded-xl border border-[#E2E7EF] bg-white px-4 text-sm text-[#0D1B2A] placeholder:text-[#5B6B7E]/70 focus:border-[#006D77] focus:outline-none focus:ring-2 focus:ring-[#006D77]/20 disabled:bg-[#F4F6FA]";
const INPUT_ERR = "border-[#C2410C] focus:border-[#C2410C] focus:ring-[#C2410C]/20";
const LABEL = "mb-1.5 block text-sm font-medium text-[#0D1B2A]";
const BTN_PRIMARY =
  "inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#006D77] px-5 text-sm font-semibold text-white shadow-[0_8px_16px_-8px_rgba(0,109,119,0.6)] transition-colors hover:bg-[#005A62] disabled:cursor-not-allowed disabled:opacity-60";
const BTN_SECONDARY =
  "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#E2E7EF] bg-white px-5 text-sm font-semibold text-[#0D1B2A] transition-colors hover:bg-[#F4F6FA] disabled:cursor-not-allowed disabled:opacity-50";
const EYEBROW =
  "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5B6B7E]";

/* -------------------------------------------------------------------------- */
/*  Icons                                                                      */
/* -------------------------------------------------------------------------- */

const Icon = ({
  children,
  className = "h-5 w-5",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const icons = {
  plus: (
    <Icon>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  ),
  search: (
    <Icon>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Icon>
  ),
  close: (
    <Icon>
      <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  ),
  edit: (
    <Icon className="h-4 w-4">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Icon>
  ),
  power: (
    <Icon className="h-4 w-4">
      <path d="M12 2v10" />
      <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
    </Icon>
  ),
  clock: (
    <Icon className="h-3.5 w-3.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),
  pin: (
    <Icon className="h-3.5 w-3.5">
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Icon>
  ),
  route: (
    <Icon className="h-3.5 w-3.5">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </Icon>
  ),
  arrow: (
    <Icon className="h-4 w-4">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  ),
  chevron: (
    <Icon className="h-4 w-4">
      <path d="m6 9 6 6 6-6" />
    </Icon>
  ),
  alert: (
    <Icon className="h-5 w-5">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </Icon>
  ),
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const TIME_24H = /^([01]\d|2[0-3]):[0-5]\d$/;
const isValidTime = (value: string) => TIME_24H.test(value);

/** "930" -> "09:30", "7" -> "07:00" */
const completeTime = (value: string) => {
  const d = value.replace(/\D/g, "");
  if (d.length === 0) return "";
  if (d.length <= 2) return `${d.padStart(2, "0")}:00`;
  if (d.length === 3) return `0${d[0]}:${d.slice(1)}`;
  return `${d.slice(0, 2)}:${d.slice(2, 4)}`;
};

const formatDuration = (hours: number) => {
  if (!hours) return "—";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 60) return `${h + 1}h 00m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
};

// "1.30" -> 1h 30m. The two digits after the dot are minutes (00-59).
const DURATION_INPUT = /^\d+(\.\d{2})?$/;

// "1.30" -> 1.5 (hours, what the backend stores)
const toHours = (value: string) => {
  if (!DURATION_INPUT.test(value)) return 0;
  const [h, m = "0"] = value.split(".");
  return Number(h) + Number(m) / 60;
};

// 1.5 -> "1.30" (hours from the backend, back into the input)
const toDurationInput = (hours: number) => {
  let h = Math.floor(hours);
  let m = Math.round((hours - h) * 60);
  if (m === 60) {
    h += 1;
    m = 0;
  }
  return `${h}.${String(m).padStart(2, "0")}`;
};

const showApiError = (error: unknown, fallback: string) => {
  console.log(error);
  if (axios.isAxiosError(error)) {
    toast.error(error.response?.data?.message ?? fallback);
  } else {
    toast.error("An unexpected error occurred.");
  }
};

/* -------------------------------------------------------------------------- */
/*  Response mapping                                                           */
/* -------------------------------------------------------------------------- */

// GET /routes -> { message, body: [{ routeId, routeName, ..., stations: [{ stationId, stationName, ... }] }] }
const mapRoutes = (res: any): RouteRecord[] =>
  (res?.body ?? []).map((r: any) => ({
    routeId: r.routeId,
    routeName: r.routeName,
    routeCode: r.routeCode,
    description: r.description ?? "",
    estimatedDurationHours: Number(r.estimatedDurationHours) || 0,
    isActive: true, // the backend only returns active routes
    stations: (r.stations ?? []).map((s: any) => ({
      station: s.stationId,
      stationName: s.stationName,
      arrivalTime: s.arrivalTime,
      departureTime: s.departureTime,
    })),
  }));

// GET /stations -> { message, body: [{ _id | id | stationId, stationName | name }] }
const mapStations = (res: any): StationOption[] =>
  (res?.body ?? [])
    .map((s: any) => ({
      id: s._id ?? s.id ?? s.stationId,
      name: s.stationName ?? s.name ?? "Unnamed station",
    }))
    .filter((s: StationOption) => s.id);

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                      */
/* -------------------------------------------------------------------------- */

const StatusPill = ({ active }: { active: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
      active ? "bg-[#E4EEE8] text-[#1B4332]" : "bg-[#E9ECF1] text-[#1C1C1C]"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#1B4332]" : "bg-[#5B6B7E]"}`}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

const Field = ({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) => (
  <label className="block">
    <span className={LABEL}>{label}</span>
    {children}
    {error ? (
      <span className="mt-1.5 block text-xs font-medium text-[#C2410C]">{error}</span>
    ) : hint ? (
      <span className="mt-1.5 block text-xs text-[#5B6B7E]">{hint}</span>
    ) : null}
  </label>
);

/** 24-hour HH:mm text input (a native time input would show AM/PM). */
const TimeInput = ({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) => (
  <input
    type="text"
    inputMode="numeric"
    autoComplete="off"
    placeholder="HH:mm"
    maxLength={5}
    value={value}
    onChange={(e) => {
      let digits = e.target.value.replace(/\D/g, "").slice(0, 4);
      if (digits.length === 1 && digits > "2") digits = `0${digits}`;
      onChange(digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits);
    }}
    onBlur={() => onChange(completeTime(value))}
    className={`${INPUT} tabular-nums ${invalid ? INPUT_ERR : ""}`}
  />
);

const StationSelect = ({
  value,
  onChange,
  options,
  placeholder,
  invalid,
}: {
  value: string;
  onChange: (id: string) => void;
  options: StationOption[];
  placeholder: string;
  invalid?: boolean;
}) => (
  <span className="relative block">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${INPUT} appearance-none pr-10 ${value ? "" : "text-[#5B6B7E]/70"} ${invalid ? INPUT_ERR : ""}`}
    >
      <option value="">{placeholder}</option>
      {options.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5B6B7E]">
      {icons.chevron}
    </span>
  </span>
);

const Modal = ({
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) => {
  // Lock page scroll while the modal is open
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-[#050A18]/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl ${
          wide ? "sm:max-w-3xl" : "sm:max-w-md"
        }`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6 sm:px-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#0D1B2A]">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-[#5B6B7E]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#5B6B7E] hover:bg-[#F4F6FA]"
          >
            {icons.close}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6 sm:px-8">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-3 border-t border-[#E2E7EF] bg-[#F8FAFC] px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Route card                                                                 */
/* -------------------------------------------------------------------------- */

const RouteCard = ({
  route,
  onEdit,
  onDeactivate,
}: {
  route: RouteRecord;
  onEdit: () => void;
  onDeactivate: () => void;
}) => {
  const first = route.stations[0];
  const last = route.stations[route.stations.length - 1];
  const hasStops = route.stations.length >= 2;
  const via = route.stations.slice(1, -1);
  const label = (stop: RouteStop) => stop.stationName ?? "Unknown station";

  return (
    <article className={`${CARD} flex flex-col overflow-hidden`}>
      <div className="flex-1 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-lg font-bold leading-snug tracking-tight">
              {route.routeName}
            </h3>
            <p className="mt-0.5 text-sm text-[#5B6B7E]">Route · {route.routeCode}</p>
          </div>
          <div className="shrink-0">
            <StatusPill active={route.isActive} />
          </div>
        </div>

        {route.description && (
          <p className="mt-3 line-clamp-2 text-sm text-[#5B6B7E]">{route.description}</p>
        )}

        <div className="mt-5 border-t border-[#E2E7EF] pt-5">
          <div className="grid grid-cols-[1.4fr_1fr] gap-x-4 gap-y-5 sm:grid-cols-3">
            <div className="col-span-2 sm:col-span-1">
              <p className={EYEBROW}>
                {icons.pin}
                From → To
              </p>
              <p className="mt-1.5 text-sm font-semibold">
                {hasStops ? `${label(first)} → ${label(last)}` : "—"}
              </p>
            </div>
            <div>
              <p className={`${EYEBROW} whitespace-nowrap`}>
                {icons.clock}
                Depart → Arrive
              </p>
              <p className="mt-1.5 text-sm font-semibold">
                {hasStops ? `${first.departureTime} → ${last.arrivalTime}` : "—"}
              </p>
            </div>
            <div>
              <p className={EYEBROW}>
                {icons.route}
                Duration
              </p>
              <p className="mt-1.5 text-sm font-semibold">
                {formatDuration(route.estimatedDurationHours)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-[#5B6B7E]">
              {route.stations.length} stations{via.length > 0 ? " · via" : ""}
            </span>
            {via.slice(0, 3).map((stop, i) => (
              <span
                key={`${stop.station}-${i}`}
                className="rounded-full bg-[#F4F6FA] px-2.5 py-1 text-xs font-medium text-[#0D1B2A]"
              >
                {label(stop)}
              </span>
            ))}
            {via.length > 3 && (
              <span className="rounded-full bg-[#F4F6FA] px-2.5 py-1 text-xs font-medium text-[#5B6B7E]">
                +{via.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6">
        <button
          type="button"
          onClick={onDeactivate}
          disabled={!route.isActive}
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#E2E7EF] bg-white px-4 text-sm font-semibold text-[#9A3412] transition-colors hover:bg-[#FDECE4] disabled:cursor-not-allowed disabled:text-[#5B6B7E] disabled:opacity-60 disabled:hover:bg-white"
        >
          {icons.power}
          {route.isActive ? "Inactivate" : "Inactive"}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#006D77] px-5 text-sm font-semibold text-white shadow-[0_8px_16px_-8px_rgba(0,109,119,0.6)] transition-colors hover:bg-[#005A62]"
        >
          {icons.edit}
          Update
        </button>
      </div>
    </article>
  );
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

const RoutePage = () => {
  // Page data
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [stations, setStations] = useState<StationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");

  // Form modal
  const [formOpen, setFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form inputs
  const [routeName, setRouteName] = useState("");
  const [routeCode, setRouteCode] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [startStation, setStartStation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endStation, setEndStation] = useState("");
  const [endTime, setEndTime] = useState("");

  // Intermediate stops
  const [viaStops, setViaStops] = useState<RouteStop[]>([]);
  const [viaStation, setViaStation] = useState("");
  const [viaArrival, setViaArrival] = useState("");
  const [viaDeparture, setViaDeparture] = useState("");
  const [viaError, setViaError] = useState("");

  // Inactivate modal
  const [toDeactivate, setToDeactivate] = useState<RouteRecord | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  /* ----------------------------- small helpers ---------------------------- */

  const clearError = (key: string) => setErrors((prev) => ({ ...prev, [key]: "" }));

  const nameOf = (id: string, fallback?: string) =>
    stations.find((s) => s.id === id)?.name ?? fallback ?? "Unknown station";

  // A station can only appear once on a route
  const optionsFor = (current: string) => {
    const taken = [startStation, endStation, ...viaStops.map((v) => v.station)].filter(
      (id) => id && id !== current,
    );
    return stations.filter((s) => !taken.includes(s.id));
  };

  const resetForm = () => {
    setRouteName("");
    setRouteCode("");
    setDescription("");
    setDuration("");
    setStartStation("");
    setStartTime("");
    setEndStation("");
    setEndTime("");
    setViaStops([]);
    setViaStation("");
    setViaArrival("");
    setViaDeparture("");
    setViaError("");
    setErrors({});
  };

  /* ------------------------------ api handlers ---------------------------- */

  const handleLoadData = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [routesRes, stationsRes] = await Promise.all([getAllRoutes(), getAllStations()]);
      setRoutes(mapRoutes(routesRes.data));
      setStations(mapStations(stationsRes.data));
    } catch (error) {
      setLoadError("We couldn't load the routes. Please try again.");
      showApiError(error, "Failed to load routes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // start -> index 0, intermediate stops in order, destination -> last index
  const buildPayload = (): RouteRequest => ({
    routeName: routeName.trim(),
    routeCode: routeCode.trim().toUpperCase(),
    description: description.trim(),
    estimatedDurationHours: toHours(duration),
    stations: [
      { station: startStation, arrivalTime: startTime, departureTime: startTime },
      ...viaStops.map(({ station, arrivalTime, departureTime }) => ({
        station,
        arrivalTime,
        departureTime,
      })),
      { station: endStation, arrivalTime: endTime, departureTime: endTime },
    ],
  });

  const handleAddRoute = async () => {
    setSaving(true);
    try {
      await addRoute(buildPayload());
      toast.success("Route added.");
      closeForm();
      await handleLoadData();
    } catch (error) {
      // the form stays open so nothing the admin typed is lost
      showApiError(error, "Failed to add the route. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRoute = async () => {
    if (!editingRoute) return;
    setSaving(true);
    try {
      await updateRoute({ ...buildPayload(), routeId: editingRoute.routeId });
      toast.success("Route updated.");
      closeForm();
      await handleLoadData();
    } catch (error) {
      showApiError(error, "Failed to update the route. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInactivateRoute = async () => {
    if (!toDeactivate) return;
    setDeactivating(true);
    try {
      await inactivateRoute(toDeactivate.routeId);
      toast.success(`${toDeactivate.routeName} is now inactive.`);
      setToDeactivate(null);
      await handleLoadData();
    } catch (error) {
      setToDeactivate(null);
      showApiError(error, "Failed to update the route. Please try again.");
    } finally {
      setDeactivating(false);
    }
  };

  /* ------------------------------ form handlers --------------------------- */

  const openAddForm = () => {
    resetForm();
    setEditingRoute(null);
    setFormOpen(true);
  };

  const openEditForm = (route: RouteRecord) => {
    resetForm();
    const first = route.stations[0];
    const last = route.stations[route.stations.length - 1];
    const hasStops = route.stations.length > 1;

    setEditingRoute(route);
    setRouteName(route.routeName);
    setRouteCode(route.routeCode);
    setDescription(route.description);
    setDuration(route.estimatedDurationHours ? toDurationInput(route.estimatedDurationHours) : "");
    setStartStation(first?.station ?? "");
    setStartTime(first?.departureTime ?? "");
    setEndStation(hasStops ? last.station : "");
    setEndTime(hasStops ? last.arrivalTime : "");
    setViaStops(route.stations.slice(1, -1));
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingRoute(null);
  };

  const handleAddStop = () => {
    if (!viaStation) return setViaError("Choose a station to add.");
    if (!viaArrival || !viaDeparture)
      return setViaError("Set both the arrival and departure time.");
    if (!isValidTime(viaArrival) || !isValidTime(viaDeparture))
      return setViaError("Use 24-hour time, e.g. 07:30 or 18:45.");

    setViaStops([
      ...viaStops,
      {
        station: viaStation,
        stationName: nameOf(viaStation),
        arrivalTime: viaArrival,
        departureTime: viaDeparture,
      },
    ]);
    setViaStation("");
    setViaArrival("");
    setViaDeparture("");
    setViaError("");
  };

  const handleRemoveStop = (index: number) => {
    setViaStops(viaStops.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const found: Record<string, string> = {};

    const name = routeName.trim();
    if (!name) found.routeName = "Route name is required.";
    else if (name.length < 6) found.routeName = "Use at least 6 characters.";
    else if (name.length > 100) found.routeName = "Keep it under 100 characters.";

    const code = routeCode.trim();
    if (!code) found.routeCode = "Route code is required.";
    else if (code.length < 2 || code.length > 10) found.routeCode = "Use 2–10 characters.";
    else if (!/^[A-Za-z0-9]+$/.test(code)) found.routeCode = "Letters and numbers only.";

    if (description.trim().length > 500) found.description = "Keep it under 500 characters.";

    if (!duration) found.duration = "Estimated duration is required.";
    else if (!DURATION_INPUT.test(duration))
      found.duration = "Use H.MM, e.g. 1.30 for 1h 30m.";
    else if (Number(duration.split(".")[1] ?? 0) > 59)
      found.duration = "Minutes must be between 00 and 59.";
    else if (toHours(duration) <= 0) found.duration = "Must be greater than zero.";

    if (!startStation) found.startStation = "Choose a start station.";
    if (!startTime) found.startTime = "Set the departure time.";
    else if (!isValidTime(startTime)) found.startTime = "Use 24-hour time, e.g. 07:30.";

    if (!endStation) found.endStation = "Choose a destination.";
    if (!endTime) found.endTime = "Set the arrival time.";
    else if (!isValidTime(endTime)) found.endTime = "Use 24-hour time, e.g. 18:45.";

    if (startStation && endStation && startStation === endStation)
      found.endStation = "Destination must differ from the start station.";

    return found;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateForm();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    if (editingRoute) handleUpdateRoute();
    else handleAddRoute();
  };

  /* -------------------------------- derived ------------------------------- */

  const q = query.trim().toLowerCase();
  const visibleRoutes = routes.filter(
    (r) =>
      !q ||
      r.routeName.toLowerCase().includes(q) ||
      r.routeCode.toLowerCase().includes(q) ||
      r.stations.some((s) => (s.stationName ?? "").toLowerCase().includes(q)),
  );

  const totalStations = (startStation ? 1 : 0) + viaStops.length + (endStation ? 1 : 0);

  /* --------------------------------- render ------------------------------- */

  return (
    <div>
      {/* Heading */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Routes</h2>
          <p className="mt-1 text-[#5B6B7E]">
            Create routes, manage their stations and switch them off when they are no longer
            running.
          </p>
        </div>
        <button type="button" onClick={openAddForm} className={BTN_PRIMARY}>
          {icons.plus}
          Add route
        </button>
      </div>

      {/* Search */}
      <div className="mt-6 flex lg:justify-end">
        <label className="relative block w-full lg:w-80">
          <span className="sr-only">Search routes</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6B7E]">
            {icons.search}
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, code or station"
            className="h-12 w-full rounded-2xl border border-[#E2E7EF] bg-white pl-11 pr-4 text-sm placeholder:text-[#5B6B7E] focus:border-[#006D77] focus:outline-none focus:ring-2 focus:ring-[#006D77]/20"
          />
        </label>
      </div>

      {/* Content */}
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {[0, 1, 2, 3].map((n) => (
              <div
                key={n}
                className={`${CARD} h-64 animate-pulse bg-linear-to-b from-white to-[#F4F6FA]`}
              />
            ))}
          </div>
        ) : loadError ? (
          <div className={`${CARD} flex flex-col items-center px-6 py-14 text-center`}>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FDECE4] text-[#9A3412]">
              {icons.alert}
            </span>
            <p className="mt-4 text-lg font-bold">Couldn’t load routes</p>
            <p className="mt-1 max-w-md text-sm text-[#5B6B7E]">{loadError}</p>
            <button type="button" onClick={handleLoadData} className={`${BTN_PRIMARY} mt-5`}>
              Try again
            </button>
          </div>
        ) : visibleRoutes.length === 0 ? (
          <div className={`${CARD} flex flex-col items-center px-6 py-14 text-center`}>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#E6F2F3] text-[#006D77]">
              {icons.route}
            </span>
            <p className="mt-4 text-lg font-bold">
              {routes.length === 0 ? "No routes yet" : "No routes match"}
            </p>
            <p className="mt-1 max-w-md text-sm text-[#5B6B7E]">
              {routes.length === 0
                ? "Add your first route to start building the timetable."
                : "Try a different search term."}
            </p>
            {routes.length === 0 && (
              <button type="button" onClick={openAddForm} className={`${BTN_PRIMARY} mt-5`}>
                {icons.plus}
                Add route
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {visibleRoutes.map((route) => (
              <RouteCard
                key={route.routeId}
                route={route}
                onEdit={() => openEditForm(route)}
                onDeactivate={() => setToDeactivate(route)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / update modal */}
      {formOpen && (
        <Modal
          wide
          title={editingRoute ? "Update route" : "Add a route"}
          subtitle={
            editingRoute
              ? "Change the route details and its station list."
              : "Define the route, then add its stations one by one."
          }
          onClose={saving ? () => undefined : closeForm}
          footer={
            <>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className={BTN_SECONDARY}
              >
                Cancel
              </button>
              <button type="submit" form="route-form" disabled={saving} className={BTN_PRIMARY}>
                {saving ? "Saving…" : editingRoute ? "Save changes" : "Add route"}
              </button>
            </>
          }
        >
          <form id="route-form" onSubmit={handleSubmit} noValidate className="space-y-8">
            {/* Live summary banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-linear-to-r from-[#0B132B] to-[#1E3A8A] px-6 py-5 text-white">
              <div className="flex items-center gap-5">
                <div>
                  <p className="text-2xl font-bold tracking-tight">{startTime || "--:--"}</p>
                  <p className="text-xs text-[#B9C6DA]">
                    {startStation ? nameOf(startStation) : "Start station"}
                  </p>
                </div>
                <span className="text-[#7FD6DC]">{icons.arrow}</span>
                <div>
                  <p className="text-2xl font-bold tracking-tight">{endTime || "--:--"}</p>
                  <p className="text-xs text-[#B9C6DA]">
                    {endStation ? nameOf(endStation) : "Destination"}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-[#B9C6DA]">
                <p className="text-sm font-semibold text-white">
                  {routeCode.trim().toUpperCase() || "Route code"}
                </p>
                <p>
                  {totalStations} station{totalStations === 1 ? "" : "s"} ·{" "}
                  {formatDuration(toHours(duration))}
                </p>
              </div>
            </div>

            {/* Details */}
            <section>
              <h3 className="mb-4 text-base font-bold text-[#0D1B2A]">Route details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Route name" error={errors.routeName}>
                  <input
                    value={routeName}
                    onChange={(e) => {
                      setRouteName(e.target.value);
                      clearError("routeName");
                    }}
                    placeholder="e.g. Colombo Fort – Kandy"
                    maxLength={100}
                    className={`${INPUT} ${errors.routeName ? INPUT_ERR : ""}`}
                  />
                </Field>
                <Field label="Route code" error={errors.routeCode}>
                  <input
                    value={routeCode}
                    onChange={(e) => {
                      setRouteCode(e.target.value.toUpperCase());
                      clearError("routeCode");
                    }}
                    placeholder="e.g. CFKY1"
                    maxLength={10}
                    className={`${INPUT} uppercase ${errors.routeCode ? INPUT_ERR : ""}`}
                  />
                </Field>
                <Field
                  label="Estimated duration (hours.minutes)"
                  error={errors.duration}
                  hint="Format H.MM – 1.30 means 1h 30m, 0.45 means 45m."
                >
                  <input
                    type="text"
                    inputMode="decimal"
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value.replace(/[^\d.]/g, ""));
                      clearError("duration");
                    }}
                    placeholder="e.g. 1.30"
                    maxLength={6}
                    className={`${INPUT} ${errors.duration ? INPUT_ERR : ""}`}
                  />
                </Field>
                <Field label="Description (optional)" error={errors.description}>
                  <input
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      clearError("description");
                    }}
                    placeholder="Short note about this route"
                    maxLength={500}
                    className={`${INPUT} ${errors.description ? INPUT_ERR : ""}`}
                  />
                </Field>
              </div>
            </section>

            {/* Stations */}
            <section>
              <h3 className="mb-1 text-base font-bold text-[#0D1B2A]">Stations</h3>
              <p className="mb-4 text-sm text-[#5B6B7E]">
                The start station is saved first and the destination last. Stops you add are
                kept in between, in the order you add them.
              </p>

              <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                <Field label="Start station" error={errors.startStation}>
                  <StationSelect
                    value={startStation}
                    onChange={(id) => {
                      setStartStation(id);
                      clearError("startStation");
                    }}
                    options={optionsFor(startStation)}
                    placeholder="Select start station"
                    invalid={!!errors.startStation}
                  />
                </Field>
                <Field label="Departure time" error={errors.startTime}>
                  <TimeInput
                    value={startTime}
                    onChange={(v) => {
                      setStartTime(v);
                      clearError("startTime");
                    }}
                    invalid={!!errors.startTime}
                  />
                </Field>
              </div>

              {/* Intermediate stops */}
              <div className="mt-5 rounded-2xl border border-[#E2E7EF] bg-[#F8FAFC] p-4">
                <p className={`${EYEBROW} mb-3`}>
                  {icons.pin}
                  Intermediate stops · {viaStops.length}
                </p>

                {viaStops.length > 0 && (
                  <ul className="mb-4 space-y-2">
                    {viaStops.map((v, i) => (
                      <li
                        key={`${v.station}-${i}`}
                        className="flex items-center gap-3 rounded-xl border border-[#E2E7EF] bg-white px-3 py-2.5"
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#E6F2F3] text-xs font-bold text-[#006D77]">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {nameOf(v.station, v.stationName)}
                          </p>
                          <p className="text-xs text-[#5B6B7E]">
                            Arrive {v.arrivalTime} · Depart {v.departureTime}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(i)}
                          aria-label={`Remove ${nameOf(v.station, v.stationName)}`}
                          title="Remove"
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#5B6B7E] hover:bg-[#FDECE4] hover:text-[#C2410C]"
                        >
                          {icons.close}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="grid gap-3 sm:grid-cols-[1fr_120px_120px_auto] sm:items-end">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[#5B6B7E]">
                      Station
                    </span>
                    <StationSelect
                      value={viaStation}
                      onChange={(id) => {
                        setViaStation(id);
                        setViaError("");
                      }}
                      options={optionsFor("")}
                      placeholder="Select station"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[#5B6B7E]">
                      Arrival
                    </span>
                    <TimeInput
                      value={viaArrival}
                      onChange={(v) => {
                        setViaArrival(v);
                        setViaError("");
                      }}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[#5B6B7E]">
                      Departure
                    </span>
                    <TimeInput
                      value={viaDeparture}
                      onChange={(v) => {
                        setViaDeparture(v);
                        setViaError("");
                      }}
                    />
                  </label>
                  <button type="button" onClick={handleAddStop} className={BTN_SECONDARY}>
                    {icons.plus}
                    Add stop
                  </button>
                </div>
                {viaError && (
                  <p className="mt-2 text-xs font-medium text-[#C2410C]">{viaError}</p>
                )}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_180px]">
                <Field label="Destination station" error={errors.endStation}>
                  <StationSelect
                    value={endStation}
                    onChange={(id) => {
                      setEndStation(id);
                      clearError("endStation");
                    }}
                    options={optionsFor(endStation)}
                    placeholder="Select destination"
                    invalid={!!errors.endStation}
                  />
                </Field>
                <Field label="Arrival time" error={errors.endTime}>
                  <TimeInput
                    value={endTime}
                    onChange={(v) => {
                      setEndTime(v);
                      clearError("endTime");
                    }}
                    invalid={!!errors.endTime}
                  />
                </Field>
              </div>
            </section>
          </form>
        </Modal>
      )}

      {/* Inactivate confirmation */}
      {toDeactivate && (
        <Modal
          title="Make this route inactive?"
          subtitle={`${toDeactivate.routeName} (${toDeactivate.routeCode}) will stop appearing as an active route. You can still update it later.`}
          onClose={deactivating ? () => undefined : () => setToDeactivate(null)}
          footer={
            <>
              <button
                type="button"
                onClick={() => setToDeactivate(null)}
                disabled={deactivating}
                className={BTN_SECONDARY}
              >
                Keep active
              </button>
              <button
                type="button"
                onClick={handleInactivateRoute}
                disabled={deactivating}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#9A3412] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#7C2A0E] disabled:opacity-60"
              >
                {icons.power}
                {deactivating ? "Updating…" : "Make inactive"}
              </button>
            </>
          }
        >
          <div className="h-2" />
        </Modal>
      )}
    </div>
  );
};




export default RoutePage;