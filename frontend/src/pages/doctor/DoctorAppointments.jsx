import { CalendarDays, Clock3, CreditCard, Video } from "lucide-react";
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

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadAppointments = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/appointments");

        if (!active) {
          return;
        }

        setAppointments(response.data.appointments || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (requestError?.status === 403) {
          setError("You are not authorized to access doctor appointments.");
        } else {
          setError(requestError.message || "Unable to load appointments.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      active = false;
    };
  }, []);

  const groupedAppointments = useMemo(() => {
    const today = [];
    const upcoming = [];
    const completed = [];
    const other = [];

    const todayKey = new Date().toISOString().slice(0, 10);

    appointments.forEach((appointment) => {
      const dateKey = getDateKey(appointment.date);
      const status = appointment.status;

      if (dateKey === todayKey) {
        today.push(appointment);
        return;
      }

      if (["pending", "confirmed"].includes(status) && dateKey > todayKey) {
        upcoming.push(appointment);
        return;
      }

      if (status === "completed") {
        completed.push(appointment);
        return;
      }

      other.push(appointment);
    });

    return {
      today,
      upcoming,
      completed,
      other,
    };
  }, [appointments]);

  const renderAppointmentCard = (appointment) => {
    const id = appointment._id || appointment.id;
    const patientName = `${appointment.patient?.firstName || "Patient"} ${
      appointment.patient?.lastName || ""
    }`.trim();

    return (
      <div
        key={id}
        className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-[#0F172A]">{patientName}</p>
            <p className="mt-1 text-sm text-[#64748B]">
              {formatDate(appointment.date)} · {appointment.startTime} -{" "}
              {appointment.endTime}
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              {appointment.patient?.email || "No email provided"}
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              {appointment.reason || "No consultation reason provided."}
            </p>
          </div>

          <StatusBadge status={appointment.status} className="shrink-0" />
        </div>

        <div className="mt-3 grid gap-2 text-sm text-[#64748B] sm:grid-cols-2">
          <p className="inline-flex items-center gap-2">
            <Video className="h-4 w-4 text-[#2563EB]" />
            {appointment.consultationType || "video"}
          </p>
          <p className="inline-flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#2563EB]" />
            Payment: {appointment.paymentStatus || "pending"}
          </p>
          <p className="inline-flex items-center gap-2 sm:col-span-2">
            <Clock3 className="h-4 w-4 text-[#2563EB]" />
            Slot: {appointment.startTime} - {appointment.endTime}
          </p>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/doctor/appointments/${id}`}
              className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-white hover:text-[#1D4ED8]"
            >
              View details
            </Link>
            <Link
              to={`/doctor/appointments/${id}/consultation`}
              className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Open consultation
            </Link>
          </div>
        </div>
      </div>
    );
  };

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
          Appointments
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          Doctor appointments
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Track today's, upcoming, completed, and past appointment activity.
        </p>
      </header>

      {appointments.length === 0 ? (
        <EmptyState
          title="No appointments assigned yet"
          description="Appointments will appear here as patients book consultations."
          Icon={CalendarDays}
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-[#0F172A]">Today</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Appointments scheduled for today.
            </p>

            <div className="mt-4 space-y-3">
              {groupedAppointments.today.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
                  No appointments scheduled for today.
                </p>
              ) : (
                groupedAppointments.today.map(renderAppointmentCard)
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[#0F172A]">Upcoming</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Pending and confirmed future appointments.
            </p>

            <div className="mt-4 space-y-3">
              {groupedAppointments.upcoming.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
                  No upcoming appointments.
                </p>
              ) : (
                groupedAppointments.upcoming.map(renderAppointmentCard)
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[#0F172A]">Completed</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Appointments marked as completed.
            </p>

            <div className="mt-4 space-y-3">
              {groupedAppointments.completed.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
                  No completed appointments yet.
                </p>
              ) : (
                groupedAppointments.completed.map(renderAppointmentCard)
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[#0F172A]">
              Other / past
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Past pending/confirmed or cancelled/rejected appointments.
            </p>

            <div className="mt-4 space-y-3">
              {groupedAppointments.other.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
                  No additional appointment records.
                </p>
              ) : (
                groupedAppointments.other.map(renderAppointmentCard)
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;
