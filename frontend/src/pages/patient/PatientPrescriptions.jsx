import { FileText, Pill } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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

function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadPrescriptions = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/prescriptions");

        if (!active) {
          return;
        }

        setPrescriptions(response.data.prescriptions || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (requestError?.status === 403) {
          setError("You are not authorized to access prescriptions.");
        } else {
          setError(requestError.message || "Unable to load prescriptions.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPrescriptions();

    return () => {
      active = false;
    };
  }, []);

  const sortedPrescriptions = useMemo(() => {
    return [...prescriptions].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [prescriptions]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" className="text-[#2563EB]" />
      </div>
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

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
          Prescriptions
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          Your prescriptions
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Review medications and instructions prescribed by your doctor.
        </p>
      </header>

      {sortedPrescriptions.length === 0 ? (
        <EmptyState
          title="No prescriptions available yet"
          description="Your prescriptions will appear here after a completed consultation and doctor's review."
          Icon={Pill}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedPrescriptions.map((prescription) => {
            const id = prescription._id || prescription.id;
            const doctorName = `${prescription.doctor?.firstName || "Doctor"} ${
              prescription.doctor?.lastName || ""
            }`.trim();
            const medicationCount = Array.isArray(prescription.medications)
              ? prescription.medications.length
              : 0;

            return (
              <Card key={id} className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#1D4ED8]">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#0F172A]">
                      Prescription from Dr. {doctorName}
                    </h2>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {formatDate(prescription.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-[#64748B]">
                  <p>
                    <span className="font-semibold text-[#334155]">
                      Appointment:
                    </span>{" "}
                    {prescription.appointment?.date
                      ? formatDate(prescription.appointment.date)
                      : "Not linked"}
                  </p>
                  <p>
                    <span className="font-semibold text-[#334155]">
                      Medications:
                    </span>{" "}
                    {medicationCount}
                  </p>
                  <p className="line-clamp-2">
                    {prescription.notes || "No additional notes provided."}
                  </p>
                </div>

                <div className="mt-5">
                  <Link
                    to={`/patient/prescriptions/${id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
                  >
                    <FileText className="h-4 w-4" />
                    View details
                  </Link>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default PatientPrescriptions;
