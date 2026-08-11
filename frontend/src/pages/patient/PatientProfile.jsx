import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import Input from "../../components/common/Input.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const validatePhone = (value) => {
  if (!value) {
    return true;
  }

  return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(value);
};

function PatientProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(user);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/users/me");

        if (!active) {
          return;
        }

        const nextProfile = response.data.user;
        setProfile(nextProfile);
        setFormData({
          firstName: nextProfile.firstName || "",
          lastName: nextProfile.lastName || "",
          phone: nextProfile.phone || "",
        });
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(requestError.message || "Unable to load profile.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const hasChanges = useMemo(() => {
    return (
      formData.firstName.trim() !== (profile?.firstName || "") ||
      formData.lastName.trim() !== (profile?.lastName || "") ||
      (formData.phone.trim() || "") !== (profile?.phone || "")
    );
  }, [formData, profile]);

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
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.firstName.trim()) {
      nextErrors.firstName = "Please enter your first name.";
    }

    if (!formData.lastName.trim()) {
      nextErrors.lastName = "Please enter your last name.";
    }

    if (formData.phone.trim() && !validatePhone(formData.phone.trim())) {
      nextErrors.phone = "Please enter a valid phone number.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || null,
      };

      const response = await api.patch("/users/me", payload);
      const nextProfile = response.data.user;

      setProfile(nextProfile);
      setFormData({
        firstName: nextProfile.firstName || "",
        lastName: nextProfile.lastName || "",
        phone: nextProfile.phone || "",
      });
      setSuccessMessage("Profile updated successfully.");
    } catch (requestError) {
      if (requestError?.status === 400) {
        setError(requestError.message || "Please review your changes.");
      } else {
        setError(requestError.message || "Unable to update profile.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      phone: profile?.phone || "",
    });
    setFieldErrors({});
    setError("");
    setSuccessMessage("");
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" className="text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
          My Profile
        </h1>
        <p className="mt-2 text-[#64748B]">Manage your personal information.</p>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]"
        >
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div
          role="status"
          className="rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] px-4 py-3 text-sm text-[#0F766E]"
        >
          {successMessage}
        </div>
      ) : null}

      <Card>
        <div className="flex flex-col gap-1 border-b border-[#E2E8F0] pb-5">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Personal information
          </h2>
          <p className="text-sm text-[#64748B]">
            Update your contact details and account display name.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              id="firstName"
              label="First name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              error={fieldErrors.firstName}
              autoComplete="given-name"
            />

            <Input
              id="lastName"
              label="Last name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              error={fieldErrors.lastName}
              autoComplete="family-name"
            />
          </div>

          <Input
            id="phone"
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={fieldErrors.phone}
            autoComplete="tel"
          />

          <Input
            id="email"
            label="Email"
            name="email"
            value={profile?.email || ""}
            disabled
            inputClassName="bg-slate-100"
          />
          <p className="-mt-3 text-xs text-[#64748B]">
            Email is managed by your account and cannot be changed here.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={!hasChanges || saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={saving}
              disabled={saving || !hasChanges}
            >
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-[#0F172A]">
          Account details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Role
            </p>
            <p className="mt-1 text-sm font-medium text-[#0F172A]">
              {profile?.role || "patient"}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Member since
            </p>
            <p className="mt-1 text-sm font-medium text-[#0F172A]">
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString()
                : "Not available"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/patient")}
            className="text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
          >
            Back to dashboard
          </button>
        </div>
      </Card>
    </div>
  );
}

export default PatientProfile;
