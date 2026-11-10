import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { ArrowLeft, Check, KeyRound, Loader2, Lock, Mail } from "lucide-react";
import {
  forgotPassword,
  login,
  resetPassword,
  verifyOTP,
} from "../../services/authService";
import AuthLayout, { AuthField } from "../../layouts/AuthLayout";
import useAuthContext from "../../hooks/useAuth";

type Step = "LOGIN" | "FORGOT" | "OTP" | "RESET";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const MIN_PASSWORD_LENGTH = 8;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return "An unexpected error occurred.";
};

const SubmitButton = ({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) => (
  <button
    type="submit"
    disabled={loading}
    className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#006D77] px-6 py-[17px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(0,109,119,0.3)] transition hover:bg-[#005A63] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/30 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {loading && <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden="true" />}
    {loading ? loadingLabel : label}
  </button>
);

const Login = () => {
  const { user } = useAuthContext();

  const [step, setStep] = useState<Step>("LOGIN");

  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");

  // Forgot password
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await login(email, password);
      const userDetails = res.data.body;

      if (!userDetails?.accessToken || !userDetails?.refreshToken) {
        toast.error("Invalid login response.");
        return;
      }

      const accessToken = userDetails.accessToken;
      const refreshToken = userDetails.refreshToken;

      localStorage.setItem("ACCESS_TOKEN", accessToken);
      localStorage.setItem("REFRESH_TOKEN", refreshToken);

      let path = "/login";

      if (userDetails.roles.includes("ADMIN")) {
        path = "/admin";

      } else if (userDetails.roles.includes("PASSENGER")) {
        path = "/passenger";

      } else if (userDetails.roles.includes("TICKET_INSPECTOR")) {
        path = "/inspector";
      }

      window.location.replace(path);

      toast.success("Login successful.");

    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Login failed. Please try again."));

    } finally {
      setLoading(false);
    }
  };

  // Forgot password

  // Send the OTP to the email
  const handleSendOtp = async () => {
    setLoading(true);

    try {
      await forgotPassword(email);

      toast.success("We sent a 6-digit code to your email.");
      setOtp("");
      setCooldown(RESEND_SECONDS);
      setStep("OTP");

    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Couldn't send the code. Please try again."));

    } finally {
      setLoading(false);
    }
  };

  // Resend the OTP from the OTP step
  const handleResendOtp = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);

    try {
      await forgotPassword(email);

      toast.success("A new code has been sent.");
      setOtp("");
      setCooldown(RESEND_SECONDS);

    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Couldn't resend the code. Please try again."));

    } finally {
      setLoading(false);
    }
  };

  // Verify the OTP and receive the reset token
  const handleVerifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      toast.error(`Enter the ${OTP_LENGTH}-digit code.`);
      return;
    }

    setLoading(true);

    try {
      const res = await verifyOTP(email, otp);
      const token = res.data.body;

      if (typeof token !== "string" || !token) {
        toast.error("Invalid verification response.");
        return;
      }

      setResetToken(token);
      setNewPassword("");
      setConfirmPassword("");
      setStep("RESET");

    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Couldn't verify the code. Please try again."));

    } finally {
      setLoading(false);
    }
  };

  // Set the new password
  const handleResetPassword = async () => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, resetToken, newPassword);

      toast.success("Password changed. Sign in with your new password.");

      setPassword("");
      setOtp("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("LOGIN");

    } catch (error) {
      console.log(error);
      toast.error(getErrorMessage(error, "Couldn't change your password. Please try again."));

    } finally {
      setLoading(false);
    }
  };


  const handleBack = () => {
    switch (step) {
      case "LOGIN":
        navigate("/");
        break;
      case "OTP":
        setStep("FORGOT");
        break;
      default:
        
        setResetToken("");
        setStep("LOGIN");
    }
  };

  const handleSubmit = () => {
    switch (step) {
      case "LOGIN":
        return handleLogin();
      case "FORGOT":
        return handleSendOtp();
      case "OTP":
        return handleVerifyOtp();
      case "RESET":
        return handleResetPassword();
    }
  };

  const content: Record<
    Step,
    { panelTitle: string; panelText: string; title: string; subtitle: string }
  > = {
    LOGIN: {
      panelTitle: "Welcome back",
      panelText: "Sign in to manage your journeys, view e-tickets and book your next trip.",
      title: "Sign in",
      subtitle: "Enter your details to access your account.",
    },
    FORGOT: {
      panelTitle: "Forgot your password?",
      panelText: "It happens. We'll email you a code so you can get back to your journeys.",
      title: "Reset your password",
      subtitle: "Enter your email and we'll send you a 6-digit code.",
    },
    OTP: {
      panelTitle: "Check your inbox",
      panelText: "Enter the code we emailed you to confirm it's really you.",
      title: "Enter your code",
      subtitle: `We sent a 6-digit code to ${email}. It expires in 5 minutes.`,
    },
    RESET: {
      panelTitle: "Almost there",
      panelText: "Choose a new password to secure your RailLanka account.",
      title: "Create a new password",
      subtitle: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
    },
  };

  const emailField = (
    <AuthField
      id="email"
      type="email"
      label="Email address"
      icon={Mail}
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="you@example.com"
      autoComplete="email"
      required
    />
  );

  return (
    <AuthLayout {...content[step]}>
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex w-fit items-center gap-2 rounded-lg py-1 pr-2 text-sm font-semibold text-[#5B6B7E] transition hover:text-[#006D77] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/20"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Back
      </button>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex flex-col gap-[22px]"
      >
        {/* ---------- Step: sign in ---------- */}
        {step === "LOGIN" && (
          <>
            {emailField}

            <AuthField
              id="password"
              type="password"
              label="Password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-[#0D1B2A]">
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <input
                    type="checkbox"
                    name="remember"
                    defaultChecked
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-[1.5px] border-[#E2E7EF] bg-white checked:border-[#006D77] checked:bg-[#006D77] focus-visible:ring-4 focus-visible:ring-[#006D77]/20"
                  />
                  <Check
                    className="pointer-events-none absolute h-[13px] w-[13px] text-white opacity-0 peer-checked:opacity-100"
                    strokeWidth={3}
                    aria-hidden="true"
                  />
                </span>
                Remember me
              </label>

              <button
                type="button"
                onClick={() => setStep("FORGOT")}
                className="text-sm font-bold text-[#006D77] hover:text-[#005A63]"
              >
                Forgot password?
              </button>
            </div>

            <SubmitButton loading={loading} label="Sign in" loadingLabel="Signing in…" />
          </>
        )}

        {/* ---------- Step: enter email ---------- */}
        {step === "FORGOT" && (
          <>
            {emailField}

            <SubmitButton loading={loading} label="Send code" loadingLabel="Sending code…" />
          </>
        )}

        {/* ---------- Step: enter OTP ---------- */}
        {step === "OTP" && (
          <>
            <AuthField
              id="otp"
              type="text"
              label="Verification code"
              icon={KeyRound}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
              placeholder="123456"
              autoComplete="one-time-code"
              required
            />

            <SubmitButton loading={loading} label="Verify code" loadingLabel="Verifying…" />

            <p className="text-center text-sm font-medium text-[#5B6B7E]">
              Didn't get the code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || loading}
                className="font-bold text-[#006D77] hover:text-[#005A63] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </p>
          </>
        )}

        {/* ---------- Step: new password ---------- */}
        {step === "RESET" && (
          <>
            <AuthField
              id="new-password"
              type="password"
              label="New password"
              icon={Lock}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter a new password"
              autoComplete="new-password"
              required
            />

            <AuthField
              id="confirm-password"
              type="password"
              label="Confirm new password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              required
            />

            <SubmitButton loading={loading} label="Change password" loadingLabel="Changing password…" />
          </>
        )}
      </form>

      {step === "LOGIN" && (
        <p className="text-center text-sm font-medium text-[#5B6B7E]">
          New to RailLanka?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-bold text-[#006D77] hover:text-[#005A63]"
          >
            Create an account
          </button>
        </p>
      )}
    </AuthLayout>
  );
};




export default Login;