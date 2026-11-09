import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CameraOff,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  ScanLine,
  SwitchCamera,
  Upload,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { scanQR } from "../../services/qrService";

type Status = "scanning" | "verifying" | "result";
type CamState = "starting" | "active" | "error";
type Facing = "environment" | "user";
type Outcome = "verified" | "used" | "expired" | "inactive" | "invalid" | "error";

type ScanRecord = {
  id: string;
  token: string;
  outcome: Outcome;
  time: string;
};

const READER_ID = "qr-reader";
const FILE_READER_ID = "qr-file-reader";
const MAX_HISTORY = 5;

const MESSAGE_TO_OUTCOME: Record<string, Outcome> = {
  "Ticket is verified.": "verified",
  "Ticket has already been used.": "used",
  "Ticket has expired.": "expired",
  "Ticket is not active.": "inactive",
};

const getOutcome = (message: string): Outcome =>
  MESSAGE_TO_OUTCOME[message.trim()] ?? "error";

const OUTCOMES: Record<
  Outcome,
  { title: string; Icon: LucideIcon; tile: string; box: string; action: string }
> = {
  verified: {
    title: "Ticket verified",
    Icon: CheckCircle2,
    tile: "bg-[#E6F2F3] text-[#006D77] ring-[#006D77]/10",
    box: "bg-[#E6F2F3] text-[#006D77]",
    action: "Scan next ticket",
  },
  used: {
    title: "Already used",
    Icon: AlertTriangle,
    tile: "bg-[#FFF6D6] text-[#8A5A00] ring-[#8A5A00]/10",
    box: "bg-[#FFF6D6] text-[#8A5A00]",
    action: "Scan next ticket",
  },
  expired: {
    title: "Ticket expired",
    Icon: Clock,
    tile: "bg-[#FFF6D6] text-[#8A5A00] ring-[#8A5A00]/10",
    box: "bg-[#FFF6D6] text-[#8A5A00]",
    action: "Scan next ticket",
  },
  inactive: {
    title: "Ticket not active",
    Icon: Ban,
    tile: "bg-[#EEF1F6] text-[#5B6B7E] ring-[#5B6B7E]/10",
    box: "bg-[#EEF1F6] text-[#5B6B7E]",
    action: "Scan next ticket",
  },
  invalid: {
    title: "Invalid ticket",
    Icon: XCircle,
    tile: "bg-[#FDECEA] text-[#B42318] ring-[#B42318]/10",
    box: "bg-[#FDECEA] text-[#B42318]",
    action: "Scan next ticket",
  },
  error: {
    title: "Verification failed",
    Icon: XCircle,
    tile: "bg-[#FDECEA] text-[#B42318] ring-[#B42318]/10",
    box: "bg-[#FDECEA] text-[#B42318]",
    action: "Try again",
  },
};

// Full-width on mobile, auto-width from `sm` up.
const btnBase =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-center text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5";
const primaryBtn = `${btnBase} bg-[#006D77] text-white hover:bg-[#005861] focus-visible:ring-[#006D77]/30`;
const secondaryBtn = `${btnBase} border border-[#E2E7EF] bg-white text-[#0D1B2A] hover:bg-[#F4F6FA] focus-visible:ring-[#006D77]/20`;

// The library injects a <video> and a shaded overlay into this element.
const readerSkin =
  "w-full !border-0 !p-0 [&_video]:block [&_video]:w-full [&_video]:object-cover";

const cardClass =
  "rounded-2xl border border-[#E2E7EF] bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6";

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const parseError = (err: unknown): { outcome: Outcome; message: string } => {
  const e = err as {
    response?: { status?: number; data?: { message?: string } };
  };
  const message =
    e?.response?.data?.message ??
    "We couldn't verify this ticket. Please try again.";
  return { outcome: e?.response?.status === 404 ? "invalid" : "error", message };
};

const getCameraError = (err: unknown): string => {
  const raw =
    typeof err === "string"
      ? err
      : `${(err as Error)?.name ?? ""} ${(err as Error)?.message ?? ""}`;
  const text = raw.toLowerCase();

  if (text.includes("notallowed") || text.includes("permission")) {
    return "Camera access is blocked. Allow camera permission in your browser settings, then try again.";
  }
  if (text.includes("notfound") || text.includes("no camera")) {
    return "No camera was found on this device. You can upload a photo of the QR code instead.";
  }
  if (text.includes("notreadable") || text.includes("in use")) {
    return "The camera is being used by another app. Close it and try again.";
  }
  return "We couldn't start the camera. Check your browser permissions and try again.";
};

const ScanPage = () => {
  const [status, setStatus] = useState<Status>("scanning");
  const [camState, setCamState] = useState<CamState>("starting");
  const [camError, setCamError] = useState("");
  const [facing, setFacing] = useState<Facing>("environment");
  const [attempt, setAttempt] = useState(0);

  const [token, setToken] = useState("");
  const [outcome, setOutcome] = useState<Outcome>("error");
  const [message, setMessage] = useState("");
  const [scannedAt, setScannedAt] = useState("");
  const [fileError, setFileError] = useState("");
  const [history, setHistory] = useState<ScanRecord[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Lets a new camera session wait until the previous one has fully stopped.
  const teardownRef = useRef<Promise<void>>(Promise.resolve());

  const verifyQRCode = useCallback(async (decodedText: string, time: string) => {
    let result: { outcome: Outcome; message: string };

    try {
      const res = await scanQR(decodedText);
      const text: string = res.data.body;
      result = { outcome: getOutcome(text), message: text };
    } catch (err) {
      console.error("Error in verifyQRCode()", err);
      result = parseError(err);
    }

    setMessage(result.message);
    setOutcome(result.outcome);
    setHistory((prev) =>
      [
        {
          id: `${Date.now()}-${prev.length}`,
          token: decodedText,
          outcome: result.outcome,
          time,
        },
        ...prev,
      ].slice(0, MAX_HISTORY)
    );
    setStatus("result");
  }, []);

  const handleDecoded = useCallback(
    (decodedText: string) => {
      const time = formatTime();
      setToken(decodedText);
      setScannedAt(time);
      setStatus("verifying");
      verifyQRCode(decodedText, time);
    },
    [verifyQRCode]
  );

  // Camera lifecycle. Safe under React StrictMode (mount, unmount, mount).
  useEffect(() => {
    if (status !== "scanning") return;

    let cancelled = false;
    let handled = false;
    const instance: { current: Html5Qrcode | null } = { current: null };
    const previous = teardownRef.current;

    const startPromise = (async () => {
      await previous;
      if (cancelled) return;

      setCamState("starting");
      setCamError("");

      const scanner = new Html5Qrcode(READER_ID, { verbose: false });
      instance.current = scanner;

      const config = {
        fps: 10,
        qrbox: (width: number, height: number) => {
          const size = Math.floor(
            Math.max(160, Math.min(320, Math.min(width, height) * 0.7))
          );
          return { width: size, height: size };
        },
      };

      const onSuccess = (decodedText: string) => {
        if (handled) return;
        handled = true;
        handleDecoded(decodedText);
      };
      const onFrameError = () => {};

      try {
        try {
          await scanner.start({ facingMode: facing }, config, onSuccess, onFrameError);
        } catch (firstErr) {
          // Some devices reject facingMode; fall back to the first camera found.
          const cameras = await Html5Qrcode.getCameras().catch(() => []);
          if (!cameras.length) throw firstErr;
          await scanner.start(cameras[0].id, config, onSuccess, onFrameError);
        }
        if (!cancelled) setCamState("active");
      } catch (err) {
        console.error("Error starting camera", err);
        if (!cancelled) {
          setCamError(getCameraError(err));
          setCamState("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      teardownRef.current = (async () => {
        await startPromise;
        try {
          if (instance.current?.isScanning) await instance.current.stop();
          instance.current?.clear();
        } catch {
          // Already stopped.
        }
      })();
    };
  }, [status, facing, attempt, handleDecoded]);

  const scanAgain = () => {
    setToken("");
    setMessage("");
    setFileError("");
    setStatus("scanning");
  };

  const switchCamera = () =>
    setFacing((f) => (f === "environment" ? "user" : "environment"));

  const retryCamera = () => setAttempt((a) => a + 1);

  const onFilePicked = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setFileError("");
    const fileScanner = new Html5Qrcode(FILE_READER_ID, { verbose: false });
    try {
      const decodedText = await fileScanner.scanFile(file, false);
      handleDecoded(decodedText);
    } catch {
      setFileError("No QR code found in that image. Try a clearer photo.");
    } finally {
      try {
        fileScanner.clear();
      } catch {
        // Nothing to clear.
      }
    }
  };

  const cfg = OUTCOMES[outcome];

  return (
    <div>
      <Link
        to=".."
        className="mb-4 inline-flex items-center gap-2 rounded-lg py-1 pr-2 text-sm font-semibold text-[#5B6B7E] transition hover:text-[#006D77] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/20"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
        Scan ticket
      </h1>
      <p className="mt-1 text-sm text-[#5B6B7E] sm:text-[15px]">
        Point the camera at the passenger&rsquo;s QR e-ticket to verify it.
      </p>

      <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Main card */}
        <section className={`${cardClass} lg:p-8`}>
          {/* Hidden mount point used when scanning an uploaded image */}
          <div id={FILE_READER_ID} className="hidden" />

          {status === "scanning" && (
            <>
              <div className="mb-4 flex items-center gap-3 sm:mb-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#E6F2F3] text-[#006D77]">
                  <ScanLine size={20} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-base font-bold sm:text-lg">Camera</h2>
                  <p className="text-xs text-[#5B6B7E] sm:text-sm">
                    Hold the QR code steady inside the frame.
                  </p>
                </div>
              </div>

              <div
                className={`relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-[#0D1B2A] ${
                  camState !== "active" ? "min-h-[280px] sm:min-h-[340px]" : ""
                }`}
              >
                <div id={READER_ID} className={readerSkin} />

                {camState === "starting" && (
                  <div
                    role="status"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0D1B2A] text-white"
                  >
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm font-medium">Starting camera…</p>
                  </div>
                )}

                {camState === "error" && (
                  <div
                    role="alert"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#F4F6FA] p-6 text-center"
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-[#FDECEA] text-[#B42318]">
                      <CameraOff size={22} />
                    </span>
                    <p className="max-w-xs text-sm font-medium text-[#0D1B2A]">
                      {camError}
                    </p>
                    <button
                      type="button"
                      onClick={retryCamera}
                      className={primaryBtn}
                    >
                      <RefreshCw size={16} />
                      Try again
                    </button>
                  </div>
                )}
              </div>

              <div className="mx-auto mt-4 grid w-full max-w-xl grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={switchCamera}
                  disabled={camState === "starting"}
                  className={secondaryBtn}
                >
                  <SwitchCamera size={16} />
                  Switch camera
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={secondaryBtn}
                >
                  <Upload size={16} />
                  Upload image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onFilePicked}
                  className="hidden"
                />
              </div>

              {fileError && (
                <p
                  role="alert"
                  className="mx-auto mt-3 max-w-xl text-sm font-medium text-[#B42318]"
                >
                  {fileError}
                </p>
              )}
            </>
          )}

          {status === "verifying" && (
            <div
              role="status"
              className="flex flex-col items-center gap-3 py-12 text-center sm:py-16"
            >
              <Loader2 className="h-8 w-8 animate-spin text-[#006D77] sm:h-10 sm:w-10" />
              <h2 className="text-lg font-bold sm:text-xl">Verifying ticket…</h2>
              <p className="w-full max-w-md truncate text-xs text-[#5B6B7E] sm:text-sm">
                {token}
              </p>
            </div>
          )}

          {status === "result" && (
            <div
              role="status"
              className="mx-auto flex max-w-md flex-col items-center gap-4 py-2 text-center sm:gap-5 sm:py-6"
            >
              <span
                className={`grid h-16 w-16 place-items-center rounded-full ring-8 sm:h-20 sm:w-20 ${cfg.tile}`}
              >
                <cfg.Icon className="h-8 w-8 sm:h-10 sm:w-10" />
              </span>

              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {cfg.title}
                </h2>
                <p className="mt-1 text-xs text-[#5B6B7E]">
                  Scanned at {scannedAt}
                </p>
              </div>

              <p
                className={`w-full break-words rounded-2xl px-4 py-3 text-sm font-semibold sm:px-5 sm:py-4 sm:text-base ${cfg.box}`}
              >
                {message}
              </p>

              <p className="w-full truncate text-xs text-[#5B6B7E]">
                Token: {token}
              </p>

              <div className="mt-1 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
                <button type="button" onClick={scanAgain} className={primaryBtn}>
                  {cfg.action}
                </button>
                <Link to=".." className={secondaryBtn}>
                  Back to dashboard
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Side panels: stacked on mobile, two columns on tablet, sidebar on laptop */}
        <aside className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          <div className={cardClass}>
            <h2 className="text-base font-bold">Tips for a clean scan</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#5B6B7E] marker:text-[#006D77]">
              <li>Hold the code steady, about a forearm away from the camera.</li>
              <li>If the ticket is on a phone screen, tilt it to avoid glare.</li>
              <li>No camera access? Upload a photo of the QR code.</li>
            </ul>
          </div>

          <div className={cardClass}>
            <h2 className="text-base font-bold">Recent scans</h2>
            {history.length === 0 ? (
              <p className="mt-3 text-sm text-[#5B6B7E]">
                Tickets you scan in this session will appear here.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-[#E2E7EF]">
                {history.map((item) => {
                  const { Icon, title, box } = OUTCOMES[item.outcome];
                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${box}`}
                      >
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="truncate text-xs text-[#5B6B7E]">
                          {item.token}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-[#5B6B7E]">
                        {item.time}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ScanPage;