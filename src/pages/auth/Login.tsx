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

      let path = "/login";

      if (userDetails.roles.includes("ADMIN")) {
        path = "/admin";

      } else if (userDetails.roles.includes("PASSENGER")) {
        path = "/inspector";
        
      } else if (userDetails.roles.includes("TICKET_INSPECTOR")) {
        path = "/passenger";
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
    }
  };

  return (
    <section className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      {/* Left side: hidden on mobile, visible on md and larger */}
      <div className="hidden min-h-screen w-full bg-slate-950 md:block">
        {/* Add your branding or image here */}
      </div>

      {/* Right side: login form */}
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-900 px-6 py-8">
        <div className="w-full max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-5"
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-200"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              <label
                htmlFor="password"
                className="mt-3 text-sm font-medium text-slate-200"
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
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500"
              >
                Login
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
