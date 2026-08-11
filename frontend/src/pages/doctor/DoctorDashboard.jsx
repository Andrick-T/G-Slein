import { CalendarDays, ClipboardList, UserRound, Users } from "lucide-react";
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

const getDateKey = (value) => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [profileResponse, appointmentsResponse] = await Promise.all([
          api.get("/auth/me"),
          api.get("/appointments"),
        ]);

        if (!active) {
          return;
        }

        setDoctor(profileResponse.data.user || null);
        setAppointments(appointmentsResponse.data.appointments || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (requestError?.status === 403) {
          setError("You are not authorized to access doctor dashboard data.");
        } else {
          setError(requestError.message || "Unable to load dashboard data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const todayKey = useMemo(() => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  const appointmentsByTimeline = useMemo(() => {
    const today = [];
    const upcoming = [];
    const completed = [];
    const pending = [];

    appointments.forEach((appointment) => {
      const status = appointment.status;
      const dateKey = getDateKey(appointment.date);

      if (status === "pending") {
        pending.push(appointment);
      }

      if (status === "completed") {
        completed.push(appointment);
      }

      if (dateKey === todayKey) {
        today.push(appointment);
        return;
      }

      if (["pending", "confirmed"].includes(status) && dateKey > todayKey) {
        upcoming.push(appointment);
      }
    });

    return {
      today,
      upcoming,
      completed,
      pending,
    };
  }, [appointments, todayKey]);

  const uniquePatientCount = useMemo(() => {
    const ids = new Set();

    appointments.forEach((appointment) => {
      const patientId = appointment.patient?._id || appointment.patient?.id;

      if (patientId) {
        ids.add(patientId);
      }
    });

    return ids.size;
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
          Doctor overview
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          Good day, Dr. {doctor?.firstName || "Doctor"}
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Here is your appointment activity and patient summary.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm font-semibold text-[#64748B]">
            Today's appointments
          </p>
          <p className="mt-2 text-3xl font-bold text-[#0F172A]">
            {appointmentsByTimeline.today.length}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-[#64748B]">
            Upcoming appointments
          </p>
          <p className="mt-2 text-3xl font-bold text-[#0F172A]">
            {appointmentsByTimeline.upcoming.length}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-[#64748B]">
            Completed appointments
          </p>
          <p className="mt-2 text-3xl font-bold text-[#0F172A]">
            {appointmentsByTimeline.completed.length}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-[#64748B]">
            Unique patients
          </p>
          <p className="mt-2 text-3xl font-bold text-[#0F172A]">
            {uniquePatientCount}
          </p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[#0F172A]">
                Today's appointments
              </h2>
              <p className="mt-1 text-sm text-[#64748B]">
                Immediate schedule for today.
              </p>
            </div>
            <CalendarDays className="h-5 w-5 text-[#2563EB]" />
          </div>

          <div className="mt-5 space-y-3">
            {appointmentsByTimeline.today.length === 0 ? (
              <EmptyState
                title="No appointments today"
                description="You're clear for today. Upcoming consultations are listed below."
                Icon={CalendarDays}
              />
            ) : (
              appointmentsByTimeline.today.map((appointment) => {
                const id = appointment._id || appointment.id;
                const patientName =
                  `${appointment.patient?.firstName || "Patient"} ${
                    appointment.patient?.lastName || ""
                  }`.trim();

                return (
                  <div
                    key={id}
                    className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0F172A]">
                          {patientName}
                        </p>
                        <p className="mt-1 text-sm text-[#64748B]">
                          {appointment.startTime} - {appointment.endTime} ·{" "}
                          {appointment.consultationType || "video"}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#64748B]">
                          {appointment.reason ||
                            "No consultation reason provided."}
                        </p>
                      </div>

                      <StatusBadge
                        status={appointment.status}
                        className="shrink-0"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D4ED8]">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A]">
                  Quick actions
                </h2>
                <p className="text-sm text-[#64748B]">
                  Stay focused on your active workload.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <Link
                to="/doctor/appointments"
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                View appointments
              </Link>

              <Link
                to="/doctor/patients"
                className="inline-flex w-full items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
              >
                View patients
              </Link>

              <Link
                to="/doctor/history"
                className="inline-flex w-full items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
              >
                Consultation history
              </Link>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CCFBF1] text-[#0F766E]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A]">
                  Upcoming appointments
                </h2>
                <p className="text-sm text-[#64748B]">
                  Your next pending and confirmed bookings.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {appointmentsByTimeline.upcoming.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
                  No upcoming appointments.
                </p>
              ) : (
                appointmentsByTimeline.upcoming
                  .slice(0, 4)
                  .map((appointment) => {
                    const id = appointment._id || appointment.id;

                    return (
                      <div
                        key={id}
                        className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3"
                      >
                        <p className="text-sm font-semibold text-[#0F172A]">
                          {appointment.patient?.firstName || "Patient"}{" "}
                          {appointment.patient?.lastName || ""}
                        </p>
                        <p className="mt-1 text-xs text-[#64748B]">
                          {formatDate(appointment.date)} ·{" "}
                          {appointment.startTime} - {appointment.endTime}
                        </p>
                        <div className="mt-2">
                          <StatusBadge status={appointment.status} />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#1D4ED8]">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A]">
                  Needs attention
                </h2>
                <p className="text-sm text-[#64748B]">
                  Pending appointment requests to review.
                </p>
              </div>
            </div>

            <p className="mt-4 text-3xl font-bold text-[#0F172A]">
              {appointmentsByTimeline.pending.length}
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default DoctorDashboard;
