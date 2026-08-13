import {
  CalendarDays,
  Clock3,
  CreditCard,
  FileText,
  Stethoscope,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import PaymentDrawer from "../../components/payment/PaymentDrawer.jsx";
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

function PatientAppointmentDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentId } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState("");

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
        } else if (requestError?.status === 403) {
          setError("You do not have access to this appointment.");
        } else if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError(
            requestError.message || "Unable to load appointment details.",
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

  useEffect(() => {
    if (!appointment) {
      return;
    }

    const query = new URLSearchParams(location.search);
    const openPayment = query.get("pay") === "1";

    if (openPayment && appointment.paymentStatus !== "paid") {
      setDrawerOpen(true);
    }
  }, [appointment, location.search]);

  const canCompletePayment =
    appointment &&
    appointment.paymentStatus !== "paid" &&
    !["cancelled", "rejected", "completed"].includes(appointment.status);

  const canJoinConsultation =
    appointment &&
    appointment.paymentStatus === "paid" &&
    appointment.status === "confirmed";

  const canViewFollowUp = appointment?.status === "completed";

  const handleStripeCheckout = async () => {
    if (!appointment) {
      return;
    }

    setPaymentError("");
    setPaying(true);

    try {
      const response = await api.post("/payments/stripe/checkout-session", {
        appointmentId: appointment._id || appointment.id,
      });

      const sessionUrl = response?.data?.session?.url;

      if (!sessionUrl) {
        throw new Error("Stripe checkout session URL was not returned.");
      }

      window.location.href = sessionUrl;
    } catch (requestError) {
      if (requestError?.status === 409) {
        setPaymentError(
          requestError.message ||
            "A payment is already in progress or already completed for this appointment.",
        );
      } else if (requestError?.status === 403) {
        setPaymentError("You are not authorized to pay for this appointment.");
      } else {
        setPaymentError(requestError.message || "Unable to start payment.");
      }
    } finally {
      setPaying(false);
    }
  };

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
        title="Appointment not found"
        description="This appointment does not exist or is no longer available."
        actionLabel="Back to appointments"
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

  const doctorName =
    `${appointment.doctor?.firstName || ""} ${appointment.doctor?.lastName || ""}`.trim();
  const specialization = appointment.doctor?.doctorProfile?.specialization;

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
          Appointment details
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A]">
          Consultation with Dr. {doctorName || "Doctor"}
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Review your appointment information and current status.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <h2 className="text-xl font-semibold text-[#0F172A]">Overview</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Doctor
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <Stethoscope className="h-4 w-4 text-[#0D9488]" />
                Dr. {doctorName || "Doctor"}
              </p>
              <p className="mt-1 text-sm text-[#64748B]">
                {specialization || "Specialization not specified"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Date
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <CalendarDays className="h-4 w-4 text-[#2563EB]" />
                {formatDate(appointment.date)}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Time
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <Clock3 className="h-4 w-4 text-[#2563EB]" />
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
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <Video className="h-4 w-4 text-[#2563EB]" />
                {appointment.consultationType || "video"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Payment status
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <CreditCard className="h-4 w-4 text-[#2563EB]" />
                {appointment.paymentStatus || "pending"}
              </p>
            </div>
          </div>

          {appointment.reason ? (
            <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Reason
              </p>
              <p className="mt-1 text-sm text-[#475569]">
                {appointment.reason}
              </p>
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[#0F172A]">Next steps</h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Complete the next valid action for this appointment based on
            backend-confirmed status.
          </p>

          <div className="mt-5 space-y-3">
            {canCompletePayment ? (
              <Button
                type="button"
                onClick={() => {
                  setPaymentError("");
                  setDrawerOpen(true);
                }}
                fullWidth
              >
                Complete payment
              </Button>
            ) : null}

            {canJoinConsultation ? (
              <Link
                to={`/patient/appointments/${appointment._id || appointment.id}/consultation`}
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                Join consultation
              </Link>
            ) : null}

            {canViewFollowUp ? (
              <>
                <Link
                  to="/patient/prescriptions"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#0D9488] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F766E]"
                >
                  View prescriptions
                </Link>
                <Link
                  to="/patient/medical-records"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
                >
                  View medical records
                </Link>
                <Link
                  to="/patient/reviews"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
                >
                  Review doctor
                </Link>
              </>
            ) : null}

            <Link
              to="/patient/appointments"
              className="inline-flex w-full items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
            >
              Back to appointments
            </Link>
            <Link
              to="/patient"
              className="inline-flex w-full items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
            >
              Back to dashboard
            </Link>
            <Link
              to="/patient/medical-records"
              className="inline-flex w-full items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
            >
              Open medical records
            </Link>
          </div>

          <div className="mt-5 rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] p-4 text-sm text-[#0F766E]">
            Consultation access depends on appointment confirmation, session
            readiness, and the current payment state.
          </div>

          {!canCompletePayment && !canJoinConsultation && !canViewFollowUp ? (
            <div className="mt-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
              No additional action is available right now for this appointment
              state.
            </div>
          ) : null}
        </Card>
      </section>

      <PaymentDrawer
        open={drawerOpen}
        appointment={appointment}
        loading={paying}
        error={paymentError}
        onClose={() => {
          if (!paying) {
            setDrawerOpen(false);
          }
        }}
        onConfirm={handleStripeCheckout}
      />
    </div>
  );
}

export default PatientAppointmentDetails;
