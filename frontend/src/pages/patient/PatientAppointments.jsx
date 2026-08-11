import { CalendarDays, Clock3, CreditCard, Plus, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

function PatientAppointments() {
  const navigate = useNavigate();

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

        setError(requestError.message || "Unable to load appointments.");
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

  const grouped = useMemo(() => {
    const upcoming = [];
    const completed = [];
    const past = [];
    const now = new Date();

    appointments.forEach((appointment) => {
      const status = appointment.status;
      const appointmentDateTime = new Date(
        `${new Date(appointment.date).toISOString().slice(0, 10)}T${
          appointment.startTime
        }:00`,
      );

      const isPendingOrConfirmed = ["pending", "confirmed"].includes(status);
      const isCompleted = status === "completed";
      const isPastByTime =
        !Number.isNaN(appointmentDateTime.getTime()) &&
        appointmentDateTime < now;

      if (isPendingOrConfirmed && !isPastByTime) {
        upcoming.push(appointment);
      } else if (isCompleted) {
        completed.push(appointment);
      } else {
        past.push(appointment);
      }
    });

    return {
      upcoming,
      completed,
      past,
    };
  }, [appointments]);

  const renderAppointmentCard = (appointment) => {
    const id = appointment._id || appointment.id;
    const doctorName = `${appointment.doctor?.firstName || "Doctor"} ${
      appointment.doctor?.lastName || ""
    }`.trim();

    return (
      <div
        key={id}
        className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="font-semibold text-[#0F172A]">Dr. {doctorName}</p>
            <p className="mt-1 text-sm text-[#0D9488]">
              {appointment.doctor?.doctorProfile?.specialization ||
                "Specialization not specified"}
            </p>
            <p className="mt-2 text-sm text-[#64748B]">
              {formatDate(appointment.date)} · {appointment.startTime} -{" "}
              {appointment.endTime}
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
          <Link
            to={`/patient/appointments/${id}`}
            className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-3 py-2 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-white hover:text-[#1D4ED8]"
          >
            View details
          </Link>
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
      <header className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
            Appointments
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            My consultations
          </h1>
          <p className="mt-2 text-sm text-[#64748B] sm:text-base">
            Track your scheduled and completed appointments.
          </p>
        </div>

        <Link
          to="/patient/doctors"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Book a doctor
        </Link>
      </header>

      {appointments.length === 0 ? (
        <EmptyState
          title="No appointments yet"
          description="You're all caught up. Book an appointment with a doctor when you're ready."
          actionLabel="Find doctors"
          onAction={() => navigate("/patient/doctors")}
          Icon={CalendarDays}
        />
      ) : (
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-[#0F172A]">Upcoming</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Upcoming pending and confirmed appointments.
            </p>

            <div className="mt-4 space-y-3">
              {grouped.upcoming.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
                  You're all caught up. Book an appointment with a doctor when
                  you're ready.
                </p>
              ) : (
                grouped.upcoming.map(renderAppointmentCard)
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[#0F172A]">Completed</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Appointments that have been completed.
            </p>

            <div className="mt-4 space-y-3">
              {grouped.completed.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
                  No completed appointments yet.
                </p>
              ) : (
                grouped.completed.map(renderAppointmentCard)
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[#0F172A]">
              Past and other
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Past pending/confirmed or cancelled/rejected appointments.
            </p>

            <div className="mt-4 space-y-3">
              {grouped.past.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
                  No previous appointments yet.
                </p>
              ) : (
                grouped.past.map(renderAppointmentCard)
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PatientAppointments;
