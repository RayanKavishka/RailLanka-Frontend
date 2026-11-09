import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Loading from "../../components/ui/Loading";
import { getMyTickets } from "../../services/ticketService";


export type QRStatus = "ACTIVE" | "USED" | "EXPIRED";

export interface TicketDetails {
  passengerId: string;
  journeyName: string;
  amount: number;
  qrImage: string;
  qrStatus: QRStatus;
  qrExpiresAt: Date;
}

const STATUS_STYLES: Record<QRStatus, { badge: string; dot: string }> = {
  ACTIVE: { badge: "bg-[#34D399]/20 text-[#A7F3D0] ring-1 ring-[#34D399]/30", dot: "bg-[#34D399]" },
  USED: { badge: "bg-white/15 text-white/80 ring-1 ring-white/20", dot: "bg-white/70" },
  EXPIRED: { badge: "bg-[#FB923C]/20 text-[#FED7AA] ring-1 ring-[#FB923C]/30", dot: "bg-[#FB923C]" },
};

const BUTTON_BASE =
  "flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006D77]";

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m7 10 5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
);

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState<TicketDetails[] | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const fetchMyTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMyTickets();

      if (response.status === 200) {
        const ticketsRes: TicketDetails[] = response.data.body;

        setTickets(ticketsRes);
      }
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {

        if (error.response?.status === 404) {
          setTickets([]);

        } else {
          toast.error(error.response?.data?.message);
        }
      } else {
        toast.error("Something went wrong.");
      }

    } finally {
      setLoading(false);
    }

  }, []);

  useEffect(() => {
    fetchMyTickets();

  }, [fetchMyTickets]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <div className="bg-[#F4F6FA]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-5 sm:px-10 sm:py-6 lg:px-20">
          <Link
            to="/passenger"
            className="inline-flex items-center gap-1 rounded text-sm font-semibold text-[#006D77] transition-colors hover:text-[#005a63] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006D77]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Home
          </Link>

          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            My Tickets
          </h1>
          <p className="mt-0.5 text-sm text-[#5B6B7E] sm:text-base">
            Your e-tickets and QR codes in one place.
          </p>

          {tickets?.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-[#C9D2DF] bg-white p-8 text-center text-[#5B6B7E]">
              You don't have any tickets yet.
            </div>
          )}

          <div className="mx-auto mt-5 grid max-w-md grid-cols-1 gap-5 md:max-w-none md:grid-cols-2 xl:grid-cols-3">
            {tickets?.map((ticket, index) => {
              const styles =
                STATUS_STYLES[ticket.qrStatus] ?? STATUS_STYLES.USED;
              const isActive = ticket.qrStatus === "ACTIVE";
              const canDownload = isActive && Boolean(ticket.qrImage);
              const hasExpiry = new Date(ticket.qrExpiresAt).getTime() > 0;
              const journey = ticket.journeyName.replace(" - ", " → ");
              const fileName = `raillanka-${ticket.journeyName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")}-${index + 1}.png`;

              return (
                <div
                  key={`${ticket.journeyName}-${ticket.qrExpiresAt}-${index}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E2E7EF] bg-white shadow-[0_1px_3px_rgba(13,27,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(0,109,119,0.25)]"
                >
                  {/* Header */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#12303F] to-[#006D77] px-5 py-4 text-white">
                    <span
                      className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl"
                      aria-hidden="true"
                    />
                    <div className="relative flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                        E-Ticket
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur ${styles.badge}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                        />
                        {ticket.qrStatus}
                      </span>
                    </div>

                    <h2 className="relative mt-2.5 text-lg font-bold leading-snug tracking-tight">
                      {journey}
                    </h2>
                  </div>

                  {/* Perforated divider */}
                  <div className="relative h-0">
                    <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full border border-[#E2E7EF] bg-[#F4F6FA]" />
                    <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full border border-[#E2E7EF] bg-[#F4F6FA]" />
                  </div>

                  {/* QR */}
                  <div className="flex flex-1 items-center justify-center px-5 pb-1 pt-5">
                    <div className="flex aspect-square w-full max-w-[150px] items-center justify-center rounded-xl bg-[#F8FAFC] p-2.5 ring-1 ring-[#E2E7EF]">
                      {ticket.qrImage ? (
                        <img
                          src={ticket.qrImage}
                          alt={`QR code for ${journey}`}
                          className={`h-full w-full rounded-md ${
                            isActive ? "" : "opacity-30 grayscale"
                          }`}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-center text-xs text-[#5B6B7E]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6"
                            aria-hidden="true"
                          >
                            <rect x="4" y="11" width="16" height="10" rx="2" />
                            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                          </svg>
                          QR not available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mx-5 mt-4 grid grid-cols-2 gap-3 border-t border-dashed border-[#C9D2DF] pt-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5B6B7E]">
                        Fare
                      </p>
                      <p className="mt-0.5 text-base font-bold tabular-nums text-[#006D77]">
                        {`LKR ${ticket.amount.toFixed(2)}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5B6B7E]">
                        {ticket.qrStatus === "EXPIRED" ? "Expired" : "Expires"}
                      </p>
                      <p className="mt-0.5 text-[13px] font-semibold leading-6">
                        {hasExpiry
                          ? new Date(ticket.qrExpiresAt).toLocaleString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                                timeZone: "Asia/Colombo",
                              },
                            )
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Download */}
                  <div className="p-5 pt-4">
                    {canDownload ? (
                      <a
                        href={ticket.qrImage}
                        download={fileName}
                        className={`${BUTTON_BASE} bg-[#006D77] text-white shadow-md shadow-[#006D77]/25 hover:bg-[#005a63] hover:shadow-lg hover:shadow-[#006D77]/30`}
                      >
                        <DownloadIcon />
                        Download QR
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className={`${BUTTON_BASE} cursor-not-allowed bg-[#EEF1F6] text-[#8A97A8]`}
                      >
                        <DownloadIcon />
                        Download QR
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
};



export default MyTicketsPage;