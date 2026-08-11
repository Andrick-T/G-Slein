import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";

import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import Input from "../../components/common/Input.jsx";
import api from "../../services/api.js";

const passwordMinLength = 8;

const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

const validatePhone = (value) => {
  if (!value) {
    return true;
  }

  return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(value);
};

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: undefined,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.firstName.trim()) {
      nextErrors.firstName = "Please enter your first name.";
    }

    if (!formData.lastName.trim()) {
      nextErrors.lastName = "Please enter your last name.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Please enter your email address.";
    } else if (!validateEmail(formData.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Please enter a password.";
    } else if (formData.password.length < passwordMinLength) {
      nextErrors.password = `Password must be at least ${passwordMinLength} characters long.`;
    }

    if (formData.phone.trim() && !validatePhone(formData.phone.trim())) {
      nextErrors.phone = "Please enter a valid phone number.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      if (formData.phone.trim()) {
        payload.phone = formData.phone.trim();
      }

      const response = await api.post("/auth/register", payload);
      const createdUser = response.data?.user;

      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully. Please sign in.",
          email: createdUser?.email || formData.email.trim(),
        },
      });
    } catch (error) {
      const backendMessage = error?.data?.message || error.message;

      if (error?.status === 409) {
        setFormError("This email is already registered.");
      } else if (error?.status === 400) {
        setFormError(backendMessage || "Please check the form and try again.");
      } else {
        setFormError(
          backendMessage || "Unable to create your account. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAFC]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8 lg:py-14">
        {/* Introduction */}
        <section className="hidden lg:block">
          <span className="inline-flex items-center rounded-full border border-[#CCFBF1] bg-[#F0FDFA] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#0F766E]">
            Patient registration
          </span>

          <h1 className="mt-5 max-w-xl text-4xl font-bold tracking-tight text-[#0F172A] xl:text-5xl xl:leading-[1.08]">
            Start your healthcare journey with G-Slein.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-[#64748B]">
            Create your patient account and get ready to discover doctors,
            manage appointments, and access your healthcare tools.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0D9488]" />

              <div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  Simple onboarding
                </p>

                <p className="mt-1 text-sm leading-5 text-[#64748B]">
                  Start with the information needed to create your patient
                  account.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0D9488]" />

              <div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  One healthcare workspace
                </p>

                <p className="mt-1 text-sm leading-5 text-[#64748B]">
                  Your account becomes the entry point for future care
                  workflows.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />

              <div>
                <p className="text-sm font-semibold text-[#0F172A]">
                  Protected access
                </p>

                <p className="mt-1 text-sm leading-5 text-[#64748B]">
                  Your account is protected through G-Slein's authentication
                  system.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Registration form */}
        <Card className="w-full max-w-2xl justify-self-center p-6 shadow-[0_20px_60px_rgba(15,23,42,0.07)] sm:p-8">
          <div className="mb-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <span className="text-sm font-bold">G</span>
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#0F172A]">
              Create your account
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              Register as a patient to continue into G-Slein.
            </p>
          </div>

          {formError ? (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm leading-5 text-[#DC2626]"
            >
              {formError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                id="firstName"
                label="First name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleChange}
                error={fieldErrors.firstName}
              />

              <Input
                id="lastName"
                label="Last name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleChange}
                error={fieldErrors.lastName}
              />
            </div>

            <Input
              id="email"
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              error={fieldErrors.email}
            />

            <Input
              id="phone"
              label="Phone number"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              error={fieldErrors.phone}
            />

            <div>
              <div className="relative">
                <Input
                  id="password"
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                  inputClassName="pr-12"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-[34px] flex h-8 w-8 items-center justify-center rounded-md text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#334155] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-[#64748B]">
                Use at least {passwordMinLength} characters.
              </p>
            </div>

            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              Create account
            </Button>
          </form>

          <div className="mt-7 border-t border-[#E2E8F0] pt-6 text-center">
            <p className="text-sm text-[#64748B]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Register;
