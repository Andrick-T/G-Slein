import { CalendarDays, History, Pill, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
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

function DoctorHistory() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      setLoading(true);
      setError("");

      try {
        const [appointmentsResponse, prescriptionsResponse] = await Promise.all(
          [api.get("/appointments"), api.get("/prescriptions")],
        );

        if (!active) {
          return;
        }

        setAppointments(appointmentsResponse.data.appointments || []);
        setPrescriptions(prescriptionsResponse.data.prescriptions || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (requestError?.status === 403) {
          setError("You are not authorized to access consultation history.");
        } else {
          setError(
            requestError.message || "Unable to load consultation history.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  const prescriptionAppointmentIds = useMemo(() => {
    return new Set(
      prescriptions
        .map(
          (prescription) =>
            prescription.appointment?._id || prescription.appointment?.id,
        )
        .filter(Boolean),
    );
  }, [prescriptions]);

  const completedAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => appointment.status === "completed")
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [appointments]);

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
          Consultation history
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          Completed consultations
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          History derived from completed doctor appointments and linked
          prescriptions.
        </p>
      </header>

      {completedAppointments.length === 0 ? (
        <EmptyState
          title="No completed consultations yet"
          description="Completed consultations will appear here after sessions are concluded."
          Icon={History}
        />
      ) : (
        <section className="space-y-4">
          {completedAppointments.map((appointment) => {
            const id = appointment._id || appointment.id;
            const hasPrescription = prescriptionAppointmentIds.has(id);

            return (
              <Card key={id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-[#0F172A]">
                      {appointment.patient?.firstName || "Patient"}{" "}
                      {appointment.patient?.lastName || ""}
                    </h2>
                    <p className="mt-1 text-sm text-[#64748B]">
                      {formatDate(appointment.date)} · {appointment.startTime} -{" "}
                      {appointment.endTime}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm text-[#64748B]">
                      <Video className="h-4 w-4 text-[#2563EB]" />
                      {appointment.consultationType || "video"}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#64748B]">
                      {appointment.reason || "No consultation reason provided."}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-2 lg:items-end">
                    <StatusBadge status={appointment.status} />
                    {hasPrescription ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CCFBF1] bg-[#F0FDFA] px-2.5 py-1 text-xs font-semibold text-[#0F766E]">
                        <Pill className="h-3.5 w-3.5" />
                        Prescription created
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8]">
                        No prescription yet
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    to={`/doctor/appointments/${id}`}
                    className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
                  >
                    Appointment details
                  </Link>
                  <Link
                    to={`/doctor/appointments/${id}/consultation`}
                    className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                  >
                    Open consultation workspace
                  </Link>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">
              Recent prescriptions
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Prescriptions authored by you, from the backend prescriptions
              endpoint.
            </p>
          </div>
          <CalendarDays className="h-5 w-5 text-[#2563EB]" />
        </div>

        <div className="mt-4 space-y-3">
          {prescriptions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
              No prescriptions available yet.
            </p>
          ) : (
            prescriptions.slice(0, 6).map((prescription) => {
              const id = prescription._id || prescription.id;

              return (
                <div
                  key={id}
                  className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                >
                  <p className="font-semibold text-[#0F172A]">
                    {prescription.patient?.firstName || "Patient"}{" "}
                    {prescription.patient?.lastName || ""}
                  </p>
                  <p className="mt-1 text-sm text-[#64748B]">
                    {formatDate(prescription.appointment?.date)} ·{" "}
                    {prescription.appointment?.startTime} -{" "}
                    {prescription.appointment?.endTime}
                  </p>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Medications:{" "}
                    {Array.isArray(prescription.medications)
                      ? prescription.medications.length
                      : 0}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

export default DoctorHistory;
