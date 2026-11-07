import { useEffect, useState, type ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import useAuthContext from "../hooks/useAuth";

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
  dashboard: (
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  ),
  stations: (
    <Icon>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </Icon>
  ),
  payments: (
    <Icon>
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <path d="M2 10h20" />
    </Icon>
  ),
  routes: (
    <Icon>
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </Icon>
  ),
  passengers: (
    <Icon>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  ),
  inspectors: (
    <Icon>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  ),
  profile: (
    <Icon>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  ),
  menu: (
    <Icon>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Icon>
  ),
  close: (
    <Icon>
      <path d="M18 6 6 18M6 6l12 12" />
    </Icon>
  ),
  logout: (
    <Icon>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </Icon>
  ),
  bell: (
    <Icon>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Icon>
  ),
  train: (
    <Icon className="h-5 w-5">
      <rect x="5" y="3" width="14" height="14" rx="4" />
      <path d="M5 11h14M9 21l2-4M15 21l-2-4" />
      <circle cx="9" cy="14" r=".5" fill="currentColor" />
      <circle cx="15" cy="14" r=".5" fill="currentColor" />
    </Icon>
  ),
};

type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
  end?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/admin", icon: icons.dashboard, end: true },
  { label: "Stations", to: "/admin/stations", icon: icons.stations },
  { label: "Payments", to: "/admin/payments", icon: icons.payments },
  { label: "Routes", to: "/admin/routes", icon: icons.routes },
  { label: "Admins", to: "/admin/admins", icon: icons.passengers },
  { label: "Inspectors", to: "/admin/inspectors", icon: icons.inspectors },
  { label: "Profile", to: "/admin/profile", icon: icons.profile },
];

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const { user } = useAuthContext();

  const CURRENT_ADMIN = {
    name: user?.fullName ?? "Admin",
    email: user?.email ?? "",
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12
      ? "Welcome, good morning"
      : hour < 17
        ? "Welcome, good afternoon"
        : "Welcome, good evening";

  const dateLabel = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");

    window.location.replace("/");
  };

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#0D1B2A]">
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-[#050A18]/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="admin-sidebar"
        aria-label="Admin navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-[#0D1B2A] via-[#0D1B2A] to-[#0A1522] text-white shadow-[8px_0_32px_rgba(13,27,42,0.18)] transition-[transform,visibility] duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full max-lg:invisible"
        }`}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between px-6">
          <NavLink to="/admin" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#008C98] to-[#006D77] text-white shadow-[0_6px_16px_rgba(0,109,119,0.45)]">
              {icons.train}
            </span>
            <span className="text-xl font-bold tracking-tight">RailLanka</span>
            <span className="rounded-full bg-[#006D77]/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#7FD6DC]">
              Admin
            </span>
          </NavLink>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-xl text-[#B9C6DA] transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            {icons.close}
          </button>
        </div>

        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7E90AB]">
            Manage
          </p>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#006D77] text-white shadow-[0_8px_20px_rgba(0,109,119,0.35)]"
                    : "text-[#B9C6DA] hover:bg-white/[0.07] hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`transition-transform duration-150 ${
                      isActive ? "" : "group-hover:translate-x-0.5"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#008C98] to-[#006D77] text-sm font-bold">
              {initialsOf(CURRENT_ADMIN.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {CURRENT_ADMIN.name}
              </p>
              <p className="truncate text-xs text-[#9FB0C8]">
                {CURRENT_ADMIN.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#B9C6DA] transition-colors hover:bg-[#B42318]/20 hover:text-[#FDA29B]"
            >
              {icons.logout}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E2E7EF]/80 bg-white/80 px-4 backdrop-blur-xl sm:h-[72px] sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="admin-sidebar"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#E2E7EF] bg-white text-[#0D1B2A] transition-colors hover:bg-[#F4F6FA] lg:hidden"
          >
            {icons.menu}
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold leading-tight tracking-tight sm:text-xl">
              {greeting}
            </h1>
            <p className="hidden text-[13px] leading-tight text-[#5B6B7E] sm:block">
              {dateLabel}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#E2E7EF] bg-white text-[#5B6B7E] transition-colors hover:border-[#006D77]/40 hover:bg-[#E6F2F3] hover:text-[#006D77]"
            >
              {icons.bell}
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#006D77] ring-2 ring-white" />
            </button>

            <span className="hidden h-8 w-px bg-[#E2E7EF] sm:block" />

            <NavLink
              to="/admin/profile"
              className="flex items-center gap-3 rounded-2xl py-1 pl-1 pr-1 transition-colors hover:bg-[#F4F6FA] sm:pr-3"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#008C98] to-[#006D77] text-sm font-bold text-white shadow-[0_4px_12px_rgba(0,109,119,0.3)]">
                {initialsOf(CURRENT_ADMIN.name)}
              </span>
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block max-w-[160px] truncate text-sm font-semibold leading-tight">
                  {CURRENT_ADMIN.name}
                </span>
                <span className="block text-[12px] leading-tight text-[#5B6B7E]">
                  Administrator
                </span>
              </span>
            </NavLink>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;