import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login } from "../../services/authService";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
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

    if (userDetails.roles.includes("ADMIN")) {
        navigate("/admin", { replace: true });

    } else if (userDetails.roles.includes("PASSENGER")) {
        navigate("/passenger", { replace: true });
        
    } else if (userDetails.roles.includes("TICKET_INSPECTOR")) {
        navigate("/inspector", { replace: true });
    }

      toast.success("Login successful.");

    } catch (error) {
      console.log(error);

      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;

        toast.error(message ?? "Login failed. Please try again.");

      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">RailLanka</h1>

          <h2 className="mt-4 text-2xl font-semibold text-slate-800">
            Welcome Back
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to continue your journey.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
