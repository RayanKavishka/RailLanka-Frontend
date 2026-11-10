import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, InputHTMLAttributes, ReactNode } from "react";
import axios from "axios";
import { toast } from "sonner";
import Loading from "../../components/ui/Loading";
import { getMyDetails } from "../../services/authService";
import { updateUser } from "../../services/userService";


export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  password?: string;
  phone: string;
  roles: string[];
  isActive: boolean;
  nic?: string;
}

type FormState = { fullName: string; email: string; phone: string };
type FormErrors = Partial<Record<keyof FormState, string>>;

const CARD = "rounded-3xl bg-white shadow-[0_6px_20px_rgba(13,27,42,0.05)]";

const toForm = (user: IUser): FormState => ({
  fullName: user.fullName ?? "",
  email: user.email ?? "",
  phone: user.phone ?? "",
});

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

const validate = (form: FormState): FormErrors => {
  const errors: FormErrors = {};

  const name = form.fullName.trim();
  if (!name) errors.fullName = "Full name is required.";
  else if (name.length < 2) errors.fullName = "Full name must be at least 2 characters.";

  const email = form.email.trim();
  if (!email) errors.email = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";

  const phone = form.phone.trim();
  const digits = phone.replace(/\D/g, "");
  if (!phone) errors.phone = "Mobile number is required.";
  else if (!/^\+?[\d\s-]+$/.test(phone) || digits.length < 9 || digits.length > 15)
    errors.phone = "Enter a valid mobile number, e.g. +94 77 123 4567.";

  return errors;
};

const Svg = ({ className = "h-5 w-5", children }: { className?: string; children: ReactNode }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const UserIcon = () => (
  <Svg>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
  </Svg>
);

const MailIcon = () => (
  <Svg>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7.5 8 5.5 8-5.5" />
  </Svg>
);

const PhoneIcon = () => (
  <Svg>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </Svg>
);

const IdIcon = () => (
  <Svg>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M3 10h18M7 15h4" />
  </Svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.2v.1" />
  </Svg>
);

const LockIcon = () => (
  <Svg className="h-4 w-4">
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Svg>
);

const LogoutIcon = () => (
  <Svg>
    <path d="M9 4.5H6.5A2 2 0 0 0 4.5 6.5v11a2 2 0 0 0 2 2H9" />
    <path d="M15 8.5 19 12l-4 3.5M19 12H9.5" />
  </Svg>
);

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity={0.3} strokeWidth={3} />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
  </svg>
);

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  icon: ReactNode;
  error?: string;
  hint?: string;
};

const Field = ({ id, label, icon, error, hint, readOnly, ...rest }: FieldProps) => {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-[#0D1B2A]">
        {label}
      </label>
      <div className="relative">
        <span
          className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${
            error ? "text-red-500" : "text-[#5B6B7E]"
          }`}
        >
          {icon}
        </span>
        <input
          id={id}
          readOnly={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            "h-12 w-full rounded-xl border-[1.5px] bg-white pl-12 pr-4 text-base text-[#0D1B2A] outline-none transition placeholder:text-[#9AA7B8]",
            readOnly
              ? "cursor-not-allowed border-[#E2E7EF] bg-[#F4F6FA] pr-11 text-[#5B6B7E]"
              : error
                ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/15"
                : "border-[#E2E7EF] hover:border-[#C9D2DF] focus:border-[#006D77] focus:ring-4 focus:ring-[#006D77]/15",
          ].join(" ")}
          {...rest}
        />
        {readOnly && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9AA7B8]">
            <LockIcon />
          </span>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
          <AlertIcon className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-[#5B6B7E]">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

const UserProfilePage = () => {
  const [user, setUser] = useState<IUser | null>(null);
  const [form, setForm] = useState<FormState>({ fullName: "", email: "", phone: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchMyDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMyDetails();

      if (response.status === 200) {
        const userRes: IUser = response.data.body;

        setUser(userRes);
        setForm(toForm(userRes));
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Something went wrong.");
      } else {
        toast.error("Something went wrong.");
      }

    } finally {
      setLoading(false);
    }

  }, []);

  useEffect(() => {
    fetchMyDetails();

  }, [fetchMyDetails]);

  const isDirty = useMemo(() => {
    if (!user) return false;
    const saved = toForm(user);
    return (
      form.fullName.trim() !== saved.fullName ||
      form.email.trim() !== saved.email ||
      form.phone.trim() !== saved.phone
    );
  }, [form, user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleCancel = () => {
    if (!user) return;
    setForm(toForm(user));
    setErrors({});
  };

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");

    window.location.replace("/");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || saving || !isDirty) return;

    const found = validate(form);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`profile-${firstInvalid}`)?.focus();
      return;
    }

    const updated: IUser = {
      ...user,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    };

    setSaving(true);
    try {
      const response = await updateUser(updated);

      if (response.status === 200) {
        setUser(updated);
        setForm(toForm(updated));
        toast.success("Your profile has been updated.");
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message: string = error.response?.data?.message ?? "Something went wrong.";

        if (error.response?.status === 409) {
          const lower = message.toLowerCase();
          if (lower.includes("email")) setErrors({ email: message });
          else if (lower.includes("phone")) setErrors({ phone: message });
        }
        toast.error(message);
        
      } else {
        toast.error("Something went wrong.");
      }

    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="bg-[#F4F6FA]">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-5 sm:px-10 sm:py-6 lg:px-20">
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">My Profile</h1>
        <p className="mt-0.5 text-sm text-[#5B6B7E] sm:text-base">
          Manage your account details.
        </p>

        {!user && (
          <div
            className={`${CARD} mt-6 flex flex-col items-center gap-4 px-6 py-12 text-center`}
            role="alert"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertIcon className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold">Couldn't load your profile</h2>
              <p className="mt-1 text-sm text-[#5B6B7E]">Please check your connection and try again.</p>
            </div>
            <button
              type="button"
              onClick={fetchMyDetails}
              className="h-11 rounded-xl bg-[#006D77] px-6 text-sm font-semibold text-white transition hover:bg-[#005a63] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/25"
            >
              Try again
            </button>
          </div>
        )}

        {user && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-7">
            <section
              aria-label="Profile summary"
              className="flex flex-col items-center gap-4 rounded-3xl bg-[linear-gradient(135deg,#0D1B2A,#1E3A8A)] p-6 text-center shadow-[0_6px_20px_rgba(13,27,42,0.12)] sm:p-8 md:flex-row md:gap-6 md:text-left lg:col-start-1 lg:row-start-1 lg:flex-col lg:gap-4 lg:py-10 lg:text-center"
            >
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#006D77] text-3xl font-bold text-white ring-4 ring-white/10 sm:h-[88px] sm:w-[88px] sm:text-[32px]"
                aria-hidden="true"
              >
                {getInitials(user.fullName ?? "")}
              </div>
              <div className="min-w-0 flex-1 lg:flex-none">
                <h2 className="break-words text-2xl font-bold text-white">{user.fullName}</h2>
                <p className="mt-1 break-all text-sm text-white/70 sm:text-base">{user.email}</p>
                <span className="mt-4 inline-block rounded-full bg-white/15 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                  {user.roles?.length ? user.roles.join(" · ") : "Passenger"}
                </span>
              </div>
            </section>

            <section
              aria-labelledby="account-details-heading"
              className={`${CARD} p-5 sm:p-8 lg:col-start-2 lg:row-span-2 lg:row-start-1`}
            >
              <h2 id="account-details-heading" className="text-xl font-bold sm:text-[22px]">
                Account details
              </h2>

              <form onSubmit={handleSubmit} noValidate className="mt-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="profile-fullName"
                    name="fullName"
                    label="Full name"
                    icon={<UserIcon />}
                    value={form.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    autoComplete="name"
                    placeholder="Your full name"
                  />

                  {user.nic ? (
                    <Field
                      id="profile-nic"
                      name="nic"
                      label="NIC / Passport number"
                      icon={<IdIcon />}
                      value={user.nic}
                      readOnly
                      hint="This can't be changed here."
                    />
                  ) : null}

                  <Field
                    id="profile-email"
                    name="email"
                    type="email"
                    label="Email address"
                    icon={<MailIcon />}
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    autoComplete="email"
                    inputMode="email"
                    placeholder="name@email.com"
                  />

                  <Field
                    id="profile-phone"
                    name="phone"
                    type="tel"
                    label="Mobile number"
                    icon={<PhoneIcon />}
                    value={form.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+94 77 123 4567"
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={!isDirty || saving}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#006D77] px-6 text-[15px] font-semibold text-white transition hover:bg-[#005a63] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {saving && <Spinner />}
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={!isDirty || saving}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#E2E7EF] bg-white px-6 text-[15px] font-semibold text-[#0D1B2A] transition hover:bg-[#F4F6FA] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#0D1B2A]/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>

            <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] border border-red-200 bg-red-50 text-[15px] font-semibold text-red-600 transition hover:bg-red-100 hover:text-red-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20 lg:col-start-1 lg:row-start-2"
            >
            <LogoutIcon />
                Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};




export default UserProfilePage;