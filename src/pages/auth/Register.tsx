import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { register } from "../../services/authService";
import AuthLayout, { AuthField } from "../../layouts/AuthLayout";

const MIN_PASSWORD_LENGTH = 8;

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register({ fullName, email, password, mobile });

      toast.success("Account created. Please sign in.");
      navigate("/login");

    } catch (error) {
      console.log(error);

      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        toast.error(message ?? "Registration failed. Please try again.");

      } else {
        toast.error("An unexpected error occurred.");
      }
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      panelTitle="Travel smarter across Sri Lanka"
      panelText="Create your passenger account to book journeys and keep every e-ticket in one place."
      title="Create your account"
      subtitle="It only takes a minute. No fees to sign up."
    >
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }} 
        className="flex flex-col gap-[22px]"
      >
        <AuthField
          id="fullName"
          type="text"
          label="Full name"
          icon={User}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nimali Perera"
          autoComplete="name"
          required
        />

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
          id="mobile"
          type="tel"
          label="Mobile number"
          icon={Phone}
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="+94 7X XXX XXXX"
          autoComplete="tel"
          required
        />

        <AuthField
          id="password"
          type="password"
          label="Password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          required
        />

        <AuthField
          id="confirmPassword"
          type="password"
          label="Confirm password"
          icon={Lock}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#006D77] px-6 py-[17px] text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(0,109,119,0.3)] transition hover:bg-[#005A63] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006D77]/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden="true" />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm font-medium text-[#5B6B7E]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="font-bold text-[#006D77] hover:text-[#005A63]"
        >
          Sign in
        </button>
      </p>
    </AuthLayout>
  );
};

export default Register;