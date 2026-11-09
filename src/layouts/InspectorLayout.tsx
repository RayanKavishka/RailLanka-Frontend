import { useCallback, useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Loader2, TrainFront } from "lucide-react";

import type { IUser } from "../context/AuthContext";
import { getMyDetails } from "../services/authService";

export type InspectorOutletContext = {
  inspector: IUser;
};

const InspectorLayout = () => {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");

  const [inspector, setInspector] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCurrentInspector = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getMyDetails();
      setInspector(res.data.body);
    } catch (err) {
      console.error("Error in fetchCurrentInspector()", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentInspector();
  }, [fetchCurrentInspector]);

  return (
    <div className="min-h-screen bg-[#F4F6FA] font-['Plus_Jakarta_Sans',ui-sans-serif,system-ui,sans-serif] text-[#0D1B2A]">
      <header className="border-b border-[#E2E7EF] bg-white">
        <div className="mx-auto flex h-[72px] w-full max-w-[1328px] items-center justify-between px-6 md:h-[88px]">
          {/* Logo */}
          <Link to="." className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#006D77] text-white">
              <TrainFront size={20} strokeWidth={2} />
            </span>
            <span className="text-[22px] font-bold tracking-tight">
              RailLanka
            </span>
          </Link>

          {/* Inspector chip */}
          <Link
            to="profile"
            aria-label="Profile Settings"
            className="flex items-center gap-3"
          >
            {inspector && (
              <span className="hidden text-sm font-semibold sm:block">
                {inspector.fullName}
              </span>
            )}
            <span
              className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white ${
                inspector ? "bg-[#006D77]" : "animate-pulse bg-[#E2E7EF]"
              }`}
            >
              {inspector ? getInitials(inspector.fullName) : ""}
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1328px] px-6 py-10 md:py-12">
        {loading && (
          <div className="flex items-center justify-center gap-3 py-24 text-[#5B6B7E]">
            <Loader2 size={22} className="animate-spin text-[#006D77]" />
            <span className="text-sm font-medium">Loading your details…</span>
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-md rounded-3xl border border-[#E2E7EF] bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold">Couldn&rsquo;t load your details</h2>
            <p className="mt-1 text-sm text-[#5B6B7E]">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={fetchCurrentInspector}
              className="mt-5 rounded-xl bg-[#006D77] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005861] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/30"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && inspector && (
          <Outlet context={{ inspector } satisfies InspectorOutletContext} />
        )}
      </main>
    </div>
  );
};

export default InspectorLayout;