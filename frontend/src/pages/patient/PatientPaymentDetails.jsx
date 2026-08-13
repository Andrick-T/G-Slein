import {
  CalendarDays,
  CreditCard,
  ReceiptText,
  Stethoscope,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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

function PatientPaymentDetails() {
  const navigate = useNavigate();
  const { paymentId } = useParams();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPayment = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const response = await api.get(`/payments/${paymentId}`);

        if (!active) {
          return;
        }

        setPayment(response.data.payment || null);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 404 || requestError?.status === 400) {
          setNotFound(true);
        } else if (requestError?.status === 403) {
          setError("You are not authorized to access this payment.");
        } else if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError(requestError.message || "Unable to load payment details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPayment();

    return () => {
      active = false;
    };
  }, [paymentId]);

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
        title="Payment not found"
        description="This payment does not exist or cannot be accessed from your account."
        actionLabel="Back to payments"
        onAction={() => navigate("/patient/payments")}
        Icon={CreditCard}
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

  if (!payment) {
    return null;
  }

  const doctorName = `${payment.doctor?.firstName || "Doctor"} ${
    payment.doctor?.lastName || ""
  }`.trim();

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
          Payment details
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A]">
          Appointment payment
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Review payment status and transaction metadata.
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
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Paid on
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
              <CalendarDays className="h-4 w-4 text-[#2563EB]" />
              {formatDate(payment.createdAt)}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Amount
            </p>
            <p className="mt-1 text-sm font-medium text-[#0F172A]">
              {payment.currency || "USD"} {payment.amount}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Provider
            </p>
            <p className="mt-1 text-sm font-medium text-[#0F172A]">
              {payment.provider || "simulated"}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Transaction reference
            </p>
            <p className="mt-1 break-all text-sm font-medium text-[#0F172A]">
              {payment.transactionId || "Not available"}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Status
            </p>
            <div className="mt-1">
              <StatusBadge status={payment.status} />
            </div>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Appointment
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-[#0F172A]">
              <ReceiptText className="h-4 w-4 text-[#2563EB]" />
              {payment.appointment?.date
                ? `${formatDate(payment.appointment.date)} · ${
                    payment.appointment.startTime
                  } - ${payment.appointment.endTime}`
                : "Not available"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/patient/payments"
            className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
          >
            Back to payments
          </Link>

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
            View appointments
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default PatientPaymentDetails;
