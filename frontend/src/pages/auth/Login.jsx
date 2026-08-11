import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import Input from "../../components/common/Input.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Secure access",
    text: "Your account is protected with role-based access.",
  },
  {
    icon: Clock3,
    title: "Pick up where you left off",
    text: "Return to your healthcare workspace without unnecessary steps.",
  },
  {
    icon: Stethoscope,
    title: "Built around care",
    text: "A focused experience for patients and healthcare teams.",
  },
];

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const initialEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: initialEmail,
    password: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || "",
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setFormData((current) => ({
        ...current,
        email: location.state.email,
      }));
    }

    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case "patient":
        return "/patient";

      case "doctor":
        return "/doctor";

      case "admin":
        return "/admin";

      default:
        return "/";
    }
  };

  const getAllowedPostLoginPath = (userRole, intendedPath) => {
    if (!intendedPath) {
      return getDashboardPath(userRole);
    }

    const dashboardPath = getDashboardPath(userRole);

    if (dashboardPath !== "/" && intendedPath.startsWith(dashboardPath)) {
      return intendedPath;
    }

    return dashboardPath;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const user = await login(formData);

      const intendedPath = location.state?.from?.pathname;

      navigate(getAllowedPostLoginPath(user.role, intendedPath), {
        replace: true,
      });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-[#DBEAFE]/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#CCFBF1]/40 blur-3xl" />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-14">
        {/* Introduction */}
        <section className="hidden lg:block">
          <div className="max-w-lg">
            <span className="inline-flex items-center rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#1D4ED8]">
              Welcome back
            </span>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#0F172A] xl:text-5xl xl:leading-[1.08]">
              Your healthcare journey, right where you left it.
            </h1>

            <p className="mt-5 text-base leading-7 text-[#64748B]">
              Sign in to access your G-Slein workspace and continue managing
              your healthcare journey.
            </p>

            <div className="mt-8 space-y-3">
              {trustPoints.map((point) => {
                const Icon = point.icon;

                return (
                  <div
                    key={point.title}
                    className="flex gap-4 rounded-2xl border border-[#E2E8F0] bg-white/90 p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-[#0F172A]">
                        {point.title}
                      </h2>

                      <p className="mt-1 text-sm leading-5 text-[#64748B]">
                        {point.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex items-center gap-2 text-sm text-[#64748B]">
              <ArrowRight className="h-4 w-4 text-[#0D9488]" />
              <span>Use the account you created during registration.</span>
            </div>
          </div>
        </section>

        {/* Login card */}
        <Card className="w-full max-w-md justify-self-center p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="mb-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#0F172A]">
              Sign in to G-Slein
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              Enter your credentials to continue to your account.
            </p>
          </div>

          {successMessage ? (
            <div
              role="status"
              className="mb-5 rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] px-4 py-3 text-sm leading-5 text-[#0F766E]"
            >
              {successMessage}
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm leading-5 text-[#DC2626]"
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
            />

            <Input
              id="password"
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
            />

            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              Sign in
            </Button>
          </form>

          <div className="mt-7 border-t border-[#E2E8F0] pt-6 text-center">
            <p className="text-sm text-[#64748B]">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8] hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Login;
