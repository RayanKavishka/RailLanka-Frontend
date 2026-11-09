import { Link, useOutletContext } from "react-router-dom";
import { ArrowRight, QrCode, UserCog } from "lucide-react";

type InspectorOutletContext = {
  inspector: { name: string; initials: string };
};

const InspectorDashboard = () => {
  const { inspector } = useOutletContext<InspectorOutletContext>();

  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight">Inspector dashboard</h1>
      <p className="mt-1 text-[15px] text-[#5B6B7E]">
        Verify passenger e-tickets and manage your account.
      </p>

      {/* Welcome card */}
      <section className="mt-8 flex items-center gap-5 rounded-3xl bg-gradient-to-br from-[#0D1B2A] to-[#1E3A8A] px-6 py-6 md:px-8">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#006D77] text-2xl font-bold text-white">
          {inspector.initials}
        </span>
        <div>
          <p className="text-sm text-[#B9C6DA]">Welcome back</p>
          <h2 className="text-2xl font-bold text-white">{inspector.name}</h2>
          <span className="mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            Inspector
          </span>
        </div>
      </section>

      {/* Actions */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Link
          to="scan"
          className="group flex min-h-[220px] flex-col justify-between rounded-3xl bg-[#006D77] p-8 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#005861] hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/30"
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
            <QrCode size={28} />
          </span>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">Scan Ticket</h3>
              <p className="mt-1 text-sm text-white/75">
                Scan a passenger&rsquo;s QR e-ticket to verify it.
              </p>
            </div>
            <ArrowRight
              size={22}
              className="shrink-0 transition-transform group-hover:translate-x-1"
            />
          </div>
        </Link>

        <Link
          to="profile"
          className="group flex min-h-[220px] flex-col justify-between rounded-3xl border border-[#E2E7EF] bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:border-[#006D77]/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/20"
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#E6F2F3] text-[#006D77]">
            <UserCog size={28} />
          </span>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">Profile Settings</h3>
              <p className="mt-1 text-sm text-[#5B6B7E]">
                Update your account details and password.
              </p>
            </div>
            <ArrowRight
              size={22}
              className="shrink-0 text-[#0D1B2A] transition-transform group-hover:translate-x-1"
            />
          </div>
        </Link>
      </div>
    </div>
  );
};



export default InspectorDashboard;