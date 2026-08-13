import {
  CalendarDays,
  ClipboardList,
  Clock3,
  CreditCard,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ConsultationMeeting from "../../components/consultation/ConsultationMeeting.jsx";
import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const buildFallbackSession = (appointment, appointmentId) => {
  return {
    appointmentId,
    consultationType: appointment?.consultationType || "video",
    jitsiDomain: "",
    meetingUrl: null,
    sessionRoomId: null,
    sessionStatus: appointment?.sessionStatus || "not_started",
    sessionStartedAt: appointment?.sessionStartedAt || null,
    sessionEndedAt: appointment?.sessionEndedAt || null,
    canJoin: false,
  };
};

const getPatientSessionNotice = (
  appointment,
  session,
  fallbackMessage = "",
) => {
  if (fallbackMessage) {
    return fallbackMessage;
  }

  if (
    appointment?.status === "confirmed" &&
    appointment?.paymentStatus === "paid"
  ) {
    if (session?.sessionStatus === "active" && session?.canJoin) {
      return "Your consultation is live. Join using the Jitsi room below.";
    }

    return "Your consultation has not started yet. Please wait for the doctor to start the session.";
  }

  if (appointment?.paymentStatus !== "paid") {
    return "Payment is required before you can join this consultation.";
  }

  if (
    appointment?.status === "completed" ||
    session?.sessionStatus === "ended"
  ) {
    return "This consultation has ended. Follow-up items remain available from your dashboard.";
  }

  return "Consultation access will become available once the appointment is confirmed and ready.";
};

function PatientConsultation() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [session, setSession] = useState(null);
  const [sessionNotice, setSessionNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const loadConsultation = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }

    const appointmentResponse = await api.get(`/appointments/${appointmentId}`);
    const nextAppointment = appointmentResponse.data.appointment || null;

    let nextSession = buildFallbackSession(nextAppointment, appointmentId);
    let nextNotice = "";

    try {
      const sessionResponse = await api.get(
        `/consultations/appointments/${appointmentId}/session`,
      );

      nextSession = sessionResponse.data.session || nextSession;
    } catch (requestError) {
      if (requestError?.status === 409) {
        nextNotice =
          requestError.message ||
          "Consultation access is not available for this appointment yet.";
      } else {
        throw requestError;
      }
    }

    setAppointment(nextAppointment);
    setSession(nextSession);
    setSessionNotice(
      getPatientSessionNotice(nextAppointment, nextSession, nextNotice),
    );
    setError("");
    setNotFound(false);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        await loadConsultation();
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 404 || requestError?.status === 400) {
          setNotFound(true);
        } else if (requestError?.status === 403) {
          setError("You do not have access to this consultation.");
        } else if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError(requestError.message || "Unable to load consultation data.");
        }

        setLoading(false);
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, [appointmentId]);

  useEffect(() => {
    if (!appointment) {
      return undefined;
    }

    const shouldPoll =
      appointment.status === "confirmed" || session?.sessionStatus === "active";

    if (!shouldPoll) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadConsultation({ silent: true }).catch(() => {});
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [appointment, session, appointmentId]);

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
        title="Consultation not found"
        description="This appointment does not exist or cannot be accessed from your account."
        actionLabel="Back to appointments"
        onAction={() => navigate("/patient/appointments")}
        Icon={ClipboardList}
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

  if (!appointment || !session) {
    return null;
  }

  const doctorName = `${appointment.doctor?.firstName || "Doctor"} ${
    appointment.doctor?.lastName || ""
  }`.trim();

  const displayName = `${user?.firstName || "Patient"} ${
    user?.lastName || ""
  }`.trim();

  const canCompletePayment =
    appointment.paymentStatus !== "paid" &&
    !["cancelled", "rejected", "completed"].includes(appointment.status);

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
          Consultation room
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A]">
          Consultation with Dr. {doctorName || "Doctor"}
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Join your authorized consultation session and monitor the current
          appointment state.
        </p>
      </header>

      {sessionNotice ? (
        <div className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 text-sm text-[#1D4ED8]">
          {sessionNotice}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Appointment context
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Doctor
              </p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">
                Dr. {doctorName || "Doctor"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Date
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <CalendarDays className="h-4 w-4 text-[#2563EB]" />
                {formatDate(appointment.date)}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Time
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <Clock3 className="h-4 w-4 text-[#2563EB]" />
                {appointment.startTime} - {appointment.endTime}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Appointment status
              </p>
              <div className="mt-1">
                <StatusBadge status={appointment.status} />
              </div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Session status
              </p>
              <div className="mt-1">
                <StatusBadge status={session.sessionStatus} />
              </div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Payment status
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <CreditCard className="h-4 w-4 text-[#2563EB]" />
                {appointment.paymentStatus || "pending"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[#0F172A]">
            What to expect
          </h2>
          <div className="mt-5 space-y-3 text-sm text-[#64748B]">
            <p className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              The consultation room only opens after the backend verifies your
              appointment access and session state.
            </p>
            <p className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              Jitsi provides the microphone, camera, and hangup controls inside
              the meeting window.
            </p>
            <p className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              Leaving the meeting does not mark your appointment as medically
              completed.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <Link
              to={`/patient/appointments/${appointment._id || appointment.id}`}
              className="inline-flex w-full items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
            >
              Back to appointment details
            </Link>
            {canCompletePayment ? (
              <Link
                to={`/patient/appointments/${appointment._id || appointment.id}?pay=1`}
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                Complete payment
              </Link>
            ) : (
              <Link
                to="/patient/payments"
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                Review payments
              </Link>
            )}
          </div>
        </Card>
      </section>

      {session.canJoin && session.sessionRoomId ? (
        <ConsultationMeeting
          domain={session.jitsiDomain || "meet.jit.si"}
          roomName={session.sessionRoomId}
          displayName={displayName}
          sessionStatus={session.sessionStatus}
          onLeave={() => navigate(`/patient/appointments/${appointmentId}`)}
        />
      ) : (
        <Card>
          <div className="flex items-start gap-3">
            <Video className="mt-0.5 h-5 w-5 text-[#2563EB]" />
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">
                Waiting for consultation access
              </h2>
              <p className="mt-2 text-sm text-[#64748B]">
                {canCompletePayment
                  ? "Complete payment to unlock consultation access for this appointment."
                  : "The live Jitsi room will appear here as soon as the consultation is active and available for your appointment."}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default PatientConsultation;
