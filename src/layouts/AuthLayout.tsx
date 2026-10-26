import type { InputHTMLAttributes, ReactNode } from "react";
import { Mail, QrCode, ShieldCheck, TrainFront } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import TrainIllustration from "../components/auth/TrainIllustration";

/* -------------------------------------------------------------------------- */
/*  Logo                                                                      */
/* -------------------------------------------------------------------------- */

export const Logo = ({ dark = false }: { dark?: boolean }) => (
  <div className="flex items-center gap-2.5">
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006D77]">
      <TrainFront className="h-[22px] w-[22px] text-white" aria-hidden="true" />
    </span>
    <span
      className={`text-[22px] font-extrabold tracking-tight ${
        dark ? "text-white" : "text-[#0D1B2A]"
      }`}
    >
      RailLanka
    </span>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Field                                                                     */
/* -------------------------------------------------------------------------- */

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const AuthField = ({ id, label, icon: Icon, className, ...rest }: AuthFieldProps) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-[13px] font-semibold text-[#0D1B2A]">
      {label}
    </label>
    <div className="flex items-center gap-2.5 rounded-xl border-[1.5px] border-[#E2E7EF] bg-white px-4 py-3.5 transition focus-within:border-[#006D77] focus-within:ring-4 focus-within:ring-[#006D77]/10">
      <Icon className="h-[18px] w-[18px] shrink-0 text-[#5B6B7E]" aria-hidden="true" />
      <input
        id={id}
        {...rest}
        className={`w-full bg-transparent text-[15px] font-medium text-[#0D1B2A] outline-none placeholder:text-[#5B6B7E]/80 ${
          className ?? ""
        }`}
      />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Layout                                                                    */
/* -------------------------------------------------------------------------- */

interface AuthLayoutProps {
  /** Large headline on the dark brand panel */
  panelTitle: string;
  /** Supporting copy under the panel headline */
  panelText: string;
  /** Form heading, e.g. "Sign in" */
  title: string;
  /** One-line description under the form heading */
  subtitle: string;
  children: ReactNode;
}

const trust = [
  { icon: QrCode, label: "QR e-tickets" },
  { icon: ShieldCheck, label: "Secure payment" },
  { icon: Mail, label: "Email confirmation" },
];

const AuthLayout = ({ panelTitle, panelText, title, subtitle, children }: AuthLayoutProps) => (
  <section className="flex min-h-screen bg-white font-['Plus_Jakarta_Sans',ui-sans-serif,system-ui,sans-serif]">
    {/* Brand panel — hidden below lg */}
    <aside className="hidden w-1/2 shrink-0 flex-col gap-16 overflow-hidden bg-gradient-to-b from-[#0D1B2A] via-[#13264F] to-[#0B132B] p-14 lg:flex xl:p-16">
      <Logo dark />

      <div className="flex flex-col gap-5">
        <TrainIllustration className="h-auto w-full max-w-[592px]" />
        <h2 className="max-w-[592px] text-[40px] font-extrabold leading-[46px] tracking-tight text-white">
          {panelTitle}
        </h2>
        <p className="max-w-[520px] text-base leading-[25px] text-white/70">{panelText}</p>
      </div>

      <ul className="flex flex-wrap gap-x-6 gap-y-3">
        {trust.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2 text-[13px] font-medium text-white/75">
            <Icon className="h-4 w-4 text-[#7FD6DC]" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </aside>

    {/* Form panel */}
    <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
      <div className="flex w-full max-w-[440px] flex-col gap-6">
        <div className="lg:hidden">
          <Logo />
        </div>

        <header className="flex flex-col gap-2">
          <h1 className="text-[34px] font-extrabold tracking-tight text-[#0D1B2A]">{title}</h1>
          <p className="text-[15px] font-medium text-[#5B6B7E]">{subtitle}</p>
        </header>

        {children}
      </div>
    </main>
  </section>
);

export default AuthLayout;