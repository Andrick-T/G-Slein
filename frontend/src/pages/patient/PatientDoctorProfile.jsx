import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Languages,
  Phone,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import api from "../../services/api.js";

const getDoctorName = (doctor) => {
  if (!doctor) {
    return "Unknown Doctor";
  }

  return `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim();
};

function PatientDoctorProfile() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDoctor = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const response = await api.get(`/doctors/${doctorId}`);

        if (!active) {
          return;
        }

        setDoctor(response.data.doctor || null);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 404 || requestError?.status === 400) {
          setNotFound(true);
        } else {
          setError(requestError.message || "Unable to load doctor details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDoctor();

    return () => {
      active = false;
    };
  }, [doctorId]);

  const profile = doctor?.doctorProfile || {};
  const fullName = useMemo(() => getDoctorName(doctor), [doctor]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" className="text-[#2563EB]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <EmptyState
        title="Doctor not found"
        description="The doctor profile you requested is not available."
        actionLabel="Back to doctors"
        onAction={() => navigate("/patient/doctors")}
        Icon={Stethoscope}
      />
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]"
      >
        {error}
      </div>
    );
  }

  if (!doctor) {
    return null;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DBEAFE] text-[#1D4ED8]">
              <UserRound className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
                Doctor profile
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0F172A]">
                Dr. {fullName || "Unknown"}
              </h1>
              <p className="mt-1 text-sm text-[#64748B]">
                {profile.specialization || "General Medicine"}
              </p>
            </div>
          </div>

          <Link to={`/patient/doctors/${doctor.id}/book`}>
            <Button>
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Book appointment
            </Button>
          </Link>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Professional information
          </h2>

          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <Stethoscope className="h-4 w-4 text-[#0D9488]" />
                Specialization
              </div>
              <p className="mt-1 text-sm text-[#475569]">
                {profile.specialization || "Not specified"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <BriefcaseBusiness className="h-4 w-4 text-[#2563EB]" />
                Experience
              </div>
              <p className="mt-1 text-sm text-[#475569]">
                {Number.isFinite(profile.experience)
                  ? `${profile.experience} years of practice`
                  : "Not specified"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <Languages className="h-4 w-4 text-[#2563EB]" />
                Languages
              </div>
              <p className="mt-1 text-sm text-[#475569]">
                {Array.isArray(profile.languages) &&
                profile.languages.length > 0
                  ? profile.languages.join(", ")
                  : "Not specified"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <ShieldCheck className="h-4 w-4 text-[#0D9488]" />
                Consultation details
              </div>
              <p className="mt-1 text-sm text-[#475569]">
                {Number.isFinite(profile.consultationFee)
                  ? `Consultation fee: $${profile.consultationFee}`
                  : "Consultation fee not specified"}
              </p>
              <p className="mt-1 text-sm text-[#475569]">
                Consultation type: Video
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <BadgeCheck className="h-4 w-4 text-[#0D9488]" />
                Bio
              </div>
              <p className="mt-1 text-sm leading-6 text-[#475569]">
                {profile.bio ||
                  "No biography has been shared for this doctor yet."}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Contact and professional profile
          </h2>

          <div className="mt-4 space-y-3 text-sm text-[#475569]">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                License number
              </p>
              <p className="mt-1 font-medium text-[#0F172A]">
                {profile.licenseNumber || "Not specified"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Contact phone
              </p>
              <p className="mt-1 flex items-center gap-2 font-medium text-[#0F172A]">
                <Phone className="h-4 w-4 text-[#64748B]" />
                {doctor.phone || "Not specified"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] p-4 text-sm text-[#0F766E]">
            Book an appointment with this doctor to reserve a consultation slot.
          </div>

          <div className="mt-5 space-y-2">
            <Link to={`/patient/doctors/${doctor.id}/book`} className="block">
              <Button fullWidth>
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Continue to booking
              </Button>
            </Link>
            <Link
              to="/patient/doctors"
              className="inline-flex w-full items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
            >
              Back to doctors
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default PatientDoctorProfile;
