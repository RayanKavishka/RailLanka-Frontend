import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { Check, Loader2, Lock, Mail } from "lucide-react";
import { login } from "../../services/authService";
import AuthLayout, { AuthField } from "../../layouts/AuthLayout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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

      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        toast.error(message ?? "Login failed. Please try again.");

      } else {
        toast.error("An unexpected error occurred.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      panelTitle="Welcome back"
      panelText="Sign in to manage your journeys, view e-tickets and book your next trip."
      title="Sign in"
      subtitle="Enter your details to access your account."
    >
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }} 
        className="flex flex-col gap-[22px]"
      >
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
            onClick={() => toast.info("Password reset isn't available yet.")}
            className="text-sm font-bold text-[#006D77] hover:text-[#005A63]"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#006D77] px-6 py-[17px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(0,109,119,0.3)] transition hover:bg-[#005A63] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden="true" />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

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
    </AuthLayout>
  );
};

export default Login;