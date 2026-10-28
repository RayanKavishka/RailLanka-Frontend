import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/* -------------------------------------------------------------------------- */
/*  Sample data — replace with your API responses                              */
/* -------------------------------------------------------------------------- */

type PaymentStatus = "Paid" | "Pending" | "Refunded" | "Failed";

type Payment = {
  id: string;
  passenger: string;
  route: string;
  amount: number;
  status: PaymentStatus;
  time: string;
};

const STATS = [
  { label: "Tickets sold today", value: "1,284", change: "+12.4%", up: true, icon: "ticket" },
  { label: "Revenue today", value: "LKR 1.86M", change: "+8.1%", up: true, icon: "wallet" },
  { label: "Registered passengers", value: "24,730", change: "+3.2%", up: true, icon: "users" },
  { label: "Active inspectors", value: "46", change: "-2", up: false, icon: "shield" },
] as const;

const WEEKLY_REVENUE = [
  { day: "Thu", value: 1.42 },
  { day: "Fri", value: 1.95 },
  { day: "Sat", value: 2.34 },
  { day: "Sun", value: 1.71 },
  { day: "Mon", value: 1.38 },
  { day: "Tue", value: 1.62 },
  { day: "Wed", value: 1.86 },
]; // LKR millions

const POPULAR_ROUTES = [
  { name: "Colombo Fort → Kandy", tickets: 412 },
  { name: "Colombo Fort → Galle", tickets: 356 },
  { name: "Kandy → Ella", tickets: 248 },
  { name: "Colombo Fort → Jaffna", tickets: 190 },
  { name: "Colombo Fort → Anuradhapura", tickets: 122 },
];

const RECENT_PAYMENTS: Payment[] = [
  { id: "PAY-48213", passenger: "Nimali Perera", route: "Colombo Fort → Kandy", amount: 900, status: "Paid", time: "10:32" },
  { id: "PAY-48212", passenger: "Kasun Fernando", route: "Kandy → Ella", amount: 1540, status: "Paid", time: "10:21" },
  { id: "PAY-48211", passenger: "Ayesha Rahman", route: "Colombo Fort → Anuradhapura", amount: 2200, status: "Pending", time: "10:08" },
  { id: "PAY-48210", passenger: "Dinesh Silva", route: "Colombo Fort → Galle", amount: 800, status: "Paid", time: "09:54" },
  { id: "PAY-48209", passenger: "Tharushi Jayasinghe", route: "Colombo Fort → Jaffna", amount: 2700, status: "Refunded", time: "09:40" },
  { id: "PAY-48208", passenger: "Ruwan Wickramasinghe", route: "Colombo Fort → Kandy", amount: 450, status: "Failed", time: "09:12" },
];

const QUICK_LINKS = [
  { label: "Manage stations", to: "/admin/stations", hint: "Add or edit stops" },
  { label: "Manage routes", to: "/admin/routes", hint: "Timetables & fares" },
  { label: "Passengers", to: "/admin/passengers", hint: "Accounts & tickets" },
  { label: "Inspectors", to: "/admin/inspectors", hint: "Staff & access" },
];

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                               */
/* -------------------------------------------------------------------------- */

const STATUS_STYLES: Record<PaymentStatus, { pill: string; dot: string }> = {
  Paid: { pill: "bg-[#E2E7EF] text-[#1B4332]", dot: "bg-[#1B4332]" },
  Pending: { pill: "bg-[#E4EBFB] text-[#1E3A8A]", dot: "bg-[#1E3A8A]" },
  Refunded: { pill: "bg-[#EFE6F8] text-[#4B0082]", dot: "bg-[#4B0082]" },
  Failed: { pill: "bg-[#EEF0F4] text-[#1C1C1C]", dot: "bg-[#1C1C1C]" },
};

const StatusPill = ({ status }: { status: PaymentStatus }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status].pill}`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[status].dot}`} />
    {status}
  </span>
);

const formatLKR = (n: number) => `LKR ${n.toLocaleString("en-LK")}`;

const Svg = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const STAT_ICONS: Record<(typeof STATS)[number]["icon"], ReactNode> = {
  ticket: (
    <Svg>
      <path d="M3 9a2 2 0 0 0 0 6v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 1 0-6V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2M13 17v2M13 11v2" />
    </Svg>
  ),
  wallet: (
    <Svg>
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5" />
      <path d="M17 13.5h.01" />
    </Svg>
  ),
  users: (
    <Svg>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  ),
  shield: (
    <Svg>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  ),
};

const ArrowRight = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Card = ({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={`rounded-2xl border border-[#E2E7EF] bg-white p-5 shadow-[0_1px_2px_rgba(13,27,42,0.04)] sm:p-6 ${className}`}
  >
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold tracking-tight sm:text-lg">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

const AdminDashboard = () => {
  const maxRevenue = Math.max(...WEEKLY_REVENUE.map((d) => d.value));
  const maxTickets = Math.max(...POPULAR_ROUTES.map((r) => r.tickets));
  const weekTotal = WEEKLY_REVENUE.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6 text-[#0D1B2A] lg:space-y-8">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
          Network overview
        </h2>
        <p className="mt-1 text-sm text-[#5B6B7E] sm:text-base">
          Today's bookings, payments and network activity at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#E2E7EF] bg-white p-4 shadow-[0_1px_2px_rgba(13,27,42,0.04)] sm:p-5"
          >
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#006D77] text-white">
                {STAT_ICONS[stat.icon]}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  stat.up ? "bg-[#E2F3F4] text-[#006D77]" : "bg-[#EEF0F4] text-[#5B6B7E]"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="mt-3 text-xl font-extrabold tracking-tight sm:mt-4 sm:text-[28px]">
              {stat.value}
            </p>
            <p className="mt-0.5 text-sm text-[#5B6B7E]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue + popular routes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card
          title="Revenue — last 7 days"
          className="lg:col-span-2"
          action={
            <span className="rounded-full bg-[#F4F6FA] px-3 py-1 text-xs font-semibold text-[#5B6B7E]">
              LKR {weekTotal.toFixed(2)}M total
            </span>
          }
        >
          <div className="flex h-56 items-end gap-2 sm:h-64 sm:gap-4">
            {WEEKLY_REVENUE.map((d, i) => {
              const isToday = i === WEEKLY_REVENUE.length - 1;
              return (
                <div
                  key={d.day}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <span className="text-[11px] font-semibold text-[#5B6B7E] sm:text-xs">
                    {d.value.toFixed(2)}
                  </span>
                  <div
                    role="img"
                    aria-label={`${d.day}: LKR ${d.value.toFixed(2)} million`}
                    className={`w-full rounded-t-lg ${
                      isToday ? "bg-[#006D77]" : "bg-[#7FD6DC]"
                    }`}
                    style={{ height: `${(d.value / maxRevenue) * 78}%` }}
                  />
                  <span
                    className={`text-xs ${
                      isToday ? "font-bold text-[#0D1B2A]" : "text-[#5B6B7E]"
                    }`}
                  >
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-[#5B6B7E]">Values in LKR millions.</p>
        </Card>

        <Card
          title="Popular routes"
          action={
            <Link
              to="/admin/routes"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#006D77] hover:underline"
            >
              View all <ArrowRight />
            </Link>
          }
        >
          <ul className="space-y-4">
            {POPULAR_ROUTES.map((route) => (
              <li key={route.name}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate font-semibold">{route.name}</span>
                  <span className="shrink-0 text-[#5B6B7E]">{route.tickets}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E7EF]">
                  <div
                    className="h-full rounded-full bg-[#006D77]"
                    style={{ width: `${(route.tickets / maxTickets) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Recent payments */}
      <Card
        title="Recent payments"
        action={
          <Link
            to="/admin/payments"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#006D77] hover:underline"
          >
            View all <ArrowRight />
          </Link>
        }
      >
        {/* Table: tablet and up */}
        <div className="-mx-5 hidden overflow-x-auto sm:-mx-6 md:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-y border-[#E2E7EF] bg-[#F4F6FA] text-[11px] font-semibold uppercase tracking-wider text-[#5B6B7E]">
                <th className="px-5 py-3 sm:px-6">Payment</th>
                <th className="px-3 py-3">Passenger</th>
                <th className="px-3 py-3">Route</th>
                <th className="px-3 py-3 text-right">Amount</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-5 py-3 text-right sm:px-6">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E7EF]">
              {RECENT_PAYMENTS.map((p) => (
                <tr key={p.id} className="hover:bg-[#F4F6FA]/60">
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-[#5B6B7E] sm:px-6">
                    {p.id}
                  </td>
                  <td className="px-3 py-3.5 font-semibold">{p.passenger}</td>
                  <td className="px-3 py-3.5 text-[#5B6B7E]">{p.route}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right font-semibold">
                    {formatLKR(p.amount)}
                  </td>
                  <td className="px-3 py-3.5">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right text-[#5B6B7E] sm:px-6">
                    {p.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards: phones */}
        <ul className="space-y-3 md:hidden">
          {RECENT_PAYMENTS.map((p) => (
            <li key={p.id} className="rounded-xl border border-[#E2E7EF] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.passenger}</p>
                  <p className="truncate text-sm text-[#5B6B7E]">{p.route}</p>
                </div>
                <StatusPill status={p.status} />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#E2E7EF] pt-3 text-sm">
                <span className="font-mono text-xs text-[#5B6B7E]">
                  {p.id} · {p.time}
                </span>
                <span className="font-bold">{formatLKR(p.amount)}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group flex items-center justify-between gap-3 rounded-2xl bg-[#0D1B2A] p-5 text-white transition-colors hover:bg-[#006D77]"
          >
            <div>
              <p className="font-bold">{link.label}</p>
              <p className="text-sm text-[#B9C6DA] group-hover:text-white/80">
                {link.hint}
              </p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 transition-transform group-hover:translate-x-0.5">
              <ArrowRight />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;