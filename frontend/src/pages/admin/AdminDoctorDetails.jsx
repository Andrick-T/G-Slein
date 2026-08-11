import { Mail, Phone, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import api from "../../services/api.js";
import { formatDateTime } from "./adminUtils.js";

function AdminDoctorDetails() {
  const navigate = useNavigate();
  const { doctorId } = useParams();

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

        if (requestError?.status === 400 || requestError?.status === 404) {
          setNotFound(true);
        } else if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (requestError?.status === 403) {
          setError("You do not have permission to access this doctor profile.");
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

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" className="text-[#0F766E]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <EmptyState
        title="Doctor not found"
        description="The requested doctor record does not exist."
        actionLabel="Back to doctors"
        onAction={() => navigate("/admin/doctors")}
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

  const fullName = `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim();

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
          Doctor details
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A]">
          Dr. {fullName || "Unknown"}
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Professional profile details exposed by current doctor endpoints.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Professional profile
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Specialization
              </p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">
                {doctor.doctorProfile?.specialization || "Not available"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                License number
              </p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">
                {doctor.doctorProfile?.licenseNumber || "Not available"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Experience
              </p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">
                {Number.isFinite(doctor.doctorProfile?.experience)
                  ? `${doctor.doctorProfile.experience} years`
                  : "Not available"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Consultation fee
              </p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">
                {Number.isFinite(doctor.doctorProfile?.consultationFee)
                  ? `${doctor.doctorProfile.consultationFee} USD`
                  : "Not available"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Languages
              </p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">
                {Array.isArray(doctor.doctorProfile?.languages) &&
                doctor.doctorProfile.languages.length > 0
                  ? doctor.doctorProfile.languages.join(", ")
                  : "Not available"}
              </p>
            </div>
          </div>

          {doctor.doctorProfile?.bio ? (
            <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Bio
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#475569]">
                {doctor.doctorProfile.bio}
              </p>
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Contact and status
          </h2>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Email
              </p>
              <p className="mt-1 inline-flex items-center gap-2 break-all text-sm font-medium text-[#0F172A]">
                <Mail className="h-4 w-4 text-[#0F766E]" />
                {doctor.email || "Not available"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Phone
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <Phone className="h-4 w-4 text-[#0F766E]" />
                {doctor.phone || "Not available"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Verification
              </p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">
                {doctor.doctorProfile?.isVerified ? "Verified" : "Not verified"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Created
              </p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">
                {formatDateTime(doctor.createdAt)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Link
              to="/admin/doctors"
              className="inline-flex w-full items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#0F766E] hover:bg-[#F8FAFC] hover:text-[#0F766E]"
            >
              Back to doctors
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default AdminDoctorDetails;
