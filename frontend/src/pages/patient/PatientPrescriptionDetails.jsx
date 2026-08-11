import {
  CalendarDays,
  Clock3,
  FileText,
  Pill,
  Stethoscope,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import api from "../../services/api.js";

const formatDate = (value) => {
  if (!value) {
    return "Date unavailable";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function PatientPrescriptionDetails() {
  const navigate = useNavigate();
  const { prescriptionId } = useParams();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPrescription = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const response = await api.get(`/prescriptions/${prescriptionId}`);

        if (!active) {
          return;
        }

        setPrescription(response.data.prescription || null);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 404 || requestError?.status === 400) {
          setNotFound(true);
        } else if (requestError?.status === 403) {
          setError("You are not authorized to access this prescription.");
        } else if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError(
            requestError.message || "Unable to load prescription details.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPrescription();

    return () => {
      active = false;
    };
  }, [prescriptionId]);

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
        title="Prescription not found"
        description="This prescription does not exist or cannot be accessed from your account."
        actionLabel="Back to prescriptions"
        onAction={() => navigate("/patient/prescriptions")}
        Icon={Pill}
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

  if (!prescription) {
    return null;
  }

  const doctorName = `${prescription.doctor?.firstName || "Doctor"} ${
    prescription.doctor?.lastName || ""
  }`.trim();

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
          Prescription details
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A]">
          Medication plan
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Review dosage and instructions prescribed by your doctor.
        </p>
      </header>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Doctor
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
              <Stethoscope className="h-4 w-4 text-[#0D9488]" />
              Dr. {doctorName}
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              {prescription.doctor?.doctorProfile?.specialization ||
                "Specialization not specified"}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Prescription date
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
              <CalendarDays className="h-4 w-4 text-[#2563EB]" />
              {formatDate(prescription.createdAt)}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Appointment slot
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
              <Clock3 className="h-4 w-4 text-[#2563EB]" />
              {prescription.appointment?.date
                ? `${formatDate(prescription.appointment.date)} · ${
                    prescription.appointment.startTime
                  } - ${prescription.appointment.endTime}`
                : "Not available"}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-white p-4">
          <h2 className="text-lg font-semibold text-[#0F172A]">Medications</h2>

          <div className="mt-4 space-y-3">
            {(prescription.medications || []).map((medication, index) => (
              <div
                key={`${medication.name}-${index}`}
                className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
              >
                <p className="font-semibold text-[#0F172A]">
                  {medication.name}
                </p>
                <div className="mt-2 grid gap-2 text-sm text-[#64748B] sm:grid-cols-2">
                  <p>
                    <span className="font-semibold text-[#334155]">
                      Dosage:
                    </span>{" "}
                    {medication.dosage}
                  </p>
                  <p>
                    <span className="font-semibold text-[#334155]">
                      Frequency:
                    </span>{" "}
                    {medication.frequency}
                  </p>
                  <p>
                    <span className="font-semibold text-[#334155]">
                      Duration:
                    </span>{" "}
                    {medication.duration}
                  </p>
                  <p>
                    <span className="font-semibold text-[#334155]">
                      Instructions:
                    </span>{" "}
                    {medication.instructions || "None"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {prescription.notes ? (
          <div className="mt-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Clinical notes
            </p>
            <p className="mt-1 text-sm text-[#475569]">{prescription.notes}</p>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/patient/prescriptions"
            className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
          >
            Back to prescriptions
          </Link>

          <Link
            to="/patient/appointments"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            <FileText className="h-4 w-4" />
            View appointments
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default PatientPrescriptionDetails;
