import { CalendarDays, CheckCircle2, Clock3, Stethoscope } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import api from "../../services/api.js";

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function PatientBookingConfirmation() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    const loadAppointment = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const response = await api.get(`/appointments/${appointmentId}`);

        if (!active) {
          return;
        }

        setAppointment(response.data.appointment || null);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 404 || requestError?.status === 400) {
          setNotFound(true);
        } else {
          setError(
            requestError.message ||
              "Unable to load this appointment confirmation right now.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAppointment();

    return () => {
      active = false;
    };
  }, [appointmentId]);

  const doctorName = useMemo(() => {
    if (!appointment?.doctor) {
      return "Doctor not available";
    }

    return `${appointment.doctor.firstName || ""} ${appointment.doctor.lastName || ""}`.trim();
  }, [appointment]);

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
        title="Booking confirmation not found"
        description="This appointment does not exist or cannot be accessed from your account."
        actionLabel="View my appointments"
        onAction={() => navigate("/patient/appointments")}
        Icon={CalendarDays}
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

  if (!appointment) {
    return null;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-2xl border border-[#CCFBF1] bg-[#F0FDFA] p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 h-7 w-7 text-[#0F766E]"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
              Booking confirmed
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A]">
              Your appointment was created successfully
            </h1>
            <p className="mt-2 text-sm text-[#475569] sm:text-base">
              Your booking has been saved and is now visible in your
              appointments.
            </p>
          </div>
        </div>
      </header>

      <Card>
        <h2 className="text-xl font-semibold text-[#0F172A]">
          Appointment summary
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Doctor
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
              <Stethoscope
                className="h-4 w-4 text-[#0D9488]"
                aria-hidden="true"
              />
              Dr. {doctorName}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Date
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
              <CalendarDays
                className="h-4 w-4 text-[#2563EB]"
                aria-hidden="true"
              />
              {formatDate(appointment.date)}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Time
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
              <Clock3 className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
              {appointment.startTime} - {appointment.endTime}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Status
            </p>
            <div className="mt-1">
              <StatusBadge status={appointment.status} />
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Consultation type
            </p>
            <p className="mt-1 text-sm font-medium text-[#0F172A]">
              {appointment.consultationType || "video"}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Payment status
            </p>
            <p className="mt-1 text-sm font-medium text-[#0F172A]">
              {appointment.paymentStatus || "pending"}
            </p>
          </div>
        </div>

        {appointment.reason ? (
          <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Reason
            </p>
            <p className="mt-1 text-sm text-[#475569]">{appointment.reason}</p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/patient"
            className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
          >
            Back to dashboard
          </Link>
          <Link
            to="/patient/appointments"
            className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            View my appointments
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default PatientBookingConfirmation;
