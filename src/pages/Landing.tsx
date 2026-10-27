import { Link } from "react-router-dom";
import TrainIllustration from "../components/auth/TrainIllustration";
import type { ReactNode } from "react";

export interface LandingProps {
  /** Router path for the Login buttons and every link that needs an account. */
  loginTo?: string;
  /** Router path for the Register buttons. */
  registerTo?: string;
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
  home: "/",
  help: "/help",
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

const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
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

const FOOTER_LINK =
  "break-words text-sm leading-5 text-white/[0.65] sm:whitespace-nowrap";

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

const TRUST_ITEMS = [
  { icon: QrIcon, label: "QR e-tickets" },
  { icon: ShieldIcon, label: "Secure payment" },
  { icon: MailIcon, label: "Email confirmation" },
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

/** Pages that need an account send visitors to the login page. */
const getFooterColumns = (
  loginTo: string,
  registerTo: string,
): FooterColumn[] => [
  {
    title: "Quick links",
    links: [
      { label: "Home", to: PATHS.home },
      { label: "Search Journeys", to: loginTo },
      { label: "My Tickets", to: loginTo },
      { label: "Booking History", to: loginTo },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", to: loginTo },
      { label: "Register", to: registerTo },
      { label: "My Profile", to: loginTo },
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
/*  Small building blocks                                                     */
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

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

const Landing = ({
  loginTo = "/login",
  registerTo = "/register",
}: LandingProps) => {
  const footerColumns = getFooterColumns(loginTo, registerTo);

  return (
    <div
      id="top"
      className="bg-white text-[#0D1B2A] antialiased [font-family:'Plus_Jakarta_Sans',Inter,system-ui,-apple-system,'Segoe_UI',Roboto,sans-serif]"
    >
      {/* ------------------------------ Hero ------------------------------ */}
      <header className="overflow-hidden bg-[linear-gradient(180deg,#0D1B2A_0%,#13264F_60%,#0B132B_100%)] pb-12 text-white sm:pb-16">
        <div className={CONTAINER}>
          <nav
            aria-label="Primary"
            className="flex h-[72px] items-center justify-between gap-6 sm:h-[88px]"
          >
            <Brand />

            {/* Tablet / laptop: buttons sit in the navbar.
                Mobile: they move into the hero (see below). */}
            <div className="hidden gap-3 sm:flex">
              <Link
                to={loginTo}
                className={`${BTN} h-[42px] rounded-[14px] border border-white px-[22px] text-[15px] font-semibold text-white`}
              >
                Login
              </Link>
              <Link
                to={registerTo}
                className={`${BTN} h-[42px] rounded-[14px] bg-[#006D77] px-[22px] text-[15px] font-semibold text-white`}
              >
                Register
              </Link>
            </div>
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

              {/* Mobile only: Login / Register as full-width hero actions */}
              <div className="mt-7 grid grid-cols-2 gap-3 sm:hidden">
                <Link
                  to={loginTo}
                  className={`${BTN} h-[48px] rounded-[14px] border border-white px-4 text-[15px] font-semibold text-white`}
                >
                  Login
                </Link>
                <Link
                  to={registerTo}
                  className={`${BTN} h-[48px] rounded-[14px] bg-[#006D77] px-4 text-[15px] font-semibold text-white shadow-[0_10px_28px_rgba(0,109,119,0.35)]`}
                >
                  Register
                </Link>
              </div>

              <ul className="mt-7 flex flex-wrap gap-x-7 gap-y-3.5 text-sm leading-[18px] text-white/80">
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
        </div>
      </header>

      <main>
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
                  {col.links.map(({ label, to }) => (
                    <li key={label}>
                      {to ? (
                        <Link
                          to={to}
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

export default Landing;