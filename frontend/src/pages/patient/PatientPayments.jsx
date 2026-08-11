import { CreditCard, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../../components/common/Button.jsx";
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

function PatientPayments() {
  const [payments, setPayments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingAppointmentId, setPayingAppointmentId] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const loadData = async () => {
    const [paymentsResponse, appointmentsResponse] = await Promise.all([
      api.get("/payments"),
      api.get("/appointments"),
    ]);

    setPayments(paymentsResponse.data.payments || []);
    setAppointments(appointmentsResponse.data.appointments || []);
  };

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [paymentsResponse, appointmentsResponse] = await Promise.all([
          api.get("/payments"),
          api.get("/appointments"),
        ]);

        if (!active) {
          return;
        }

        setPayments(paymentsResponse.data.payments || []);
        setAppointments(appointmentsResponse.data.appointments || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (requestError?.status === 403) {
          setError("You are not authorized to access payments.");
        } else {
          setError(requestError.message || "Unable to load payments.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, []);

  const pendingPaymentAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const status = appointment.status;
      const paymentStatus = appointment.paymentStatus;

      if (["cancelled", "rejected"].includes(status)) {
        return false;
      }

      return paymentStatus !== "paid";
    });
  }, [appointments]);

  const handleSimulatedPayment = async (appointment) => {
    setActionError("");
    setActionSuccess("");
    setPayingAppointmentId(appointment._id || appointment.id);

    const amount = Number(
      appointment.doctor?.doctorProfile?.consultationFee || 0,
    );

    if (!Number.isFinite(amount) || amount <= 0) {
      setActionError(
        "Consultation fee is not available for this appointment. Payment cannot be initiated.",
      );
      setPayingAppointmentId("");
      return;
    }

    try {
      await api.post("/payments", {
        appointment: appointment._id || appointment.id,
        amount,
        currency: "USD",
      });

      await loadData();
      setActionSuccess("Payment completed successfully (simulated provider).");
    } catch (requestError) {
      if (requestError?.status === 409) {
        setActionError(
          requestError.message ||
            "A payment already exists for this appointment.",
        );
      } else if (requestError?.status === 400) {
        setActionError(requestError.message || "Unable to process payment.");
      } else {
        setActionError(requestError.message || "Payment request failed.");
      }
    } finally {
      setPayingAppointmentId("");
    }
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
          Payments
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          Payment history
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Track appointment payments and complete pending consultation payments.
        </p>
      </header>

      {actionError ? (
        <div
          role="alert"
          className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]"
        >
          {actionError}
        </div>
      ) : null}

      {actionSuccess ? (
        <div
          role="status"
          className="rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] px-4 py-3 text-sm text-[#0F766E]"
        >
          {actionSuccess}
        </div>
      ) : null}

      <Card>
        <h2 className="text-lg font-semibold text-[#0F172A]">
          Pending payments
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Payments are currently processed using the backend simulated provider.
        </p>

        <div className="mt-4 space-y-3">
          {pendingPaymentAppointments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
              No pending payments.
            </p>
          ) : (
            pendingPaymentAppointments.map((appointment) => {
              const appointmentId = appointment._id || appointment.id;
              const fee = Number(
                appointment.doctor?.doctorProfile?.consultationFee || 0,
              );

              return (
                <div
                  key={appointmentId}
                  className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-[#0F172A]">
                        Dr. {appointment.doctor?.firstName || "Doctor"}{" "}
                        {appointment.doctor?.lastName || ""}
                      </p>
                      <p className="mt-1 text-sm text-[#64748B]">
                        {formatDate(appointment.date)} · {appointment.startTime}{" "}
                        - {appointment.endTime}
                      </p>
                      <p className="mt-1 text-sm text-[#64748B]">
                        Amount: {fee > 0 ? `$${fee}` : "Not available"}
                      </p>
                    </div>

                    <Button
                      type="button"
                      loading={payingAppointmentId === appointmentId}
                      disabled={
                        payingAppointmentId === appointmentId || fee <= 0
                      }
                      onClick={() => handleSimulatedPayment(appointment)}
                    >
                      Pay now
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {payments.length === 0 ? (
        <EmptyState
          title="No payment records yet"
          description="Payment transactions for your appointments will appear here."
          Icon={CreditCard}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {payments.map((payment) => {
            const id = payment._id || payment.id;
            const doctorName = `${payment.doctor?.firstName || "Doctor"} ${
              payment.doctor?.lastName || ""
            }`.trim();

            return (
              <Card key={id} className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#1D4ED8]">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#0F172A]">
                      Payment for Dr. {doctorName}
                    </h2>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-[#64748B]">
                  <p>
                    <span className="font-semibold text-[#334155]">
                      Amount:
                    </span>{" "}
                    {payment.currency || "USD"} {payment.amount}
                  </p>
                  <p>
                    <span className="font-semibold text-[#334155]">
                      Provider:
                    </span>{" "}
                    {payment.provider || "simulated"}
                  </p>
                  <p>
                    <span className="font-semibold text-[#334155]">
                      Transaction:
                    </span>{" "}
                    {payment.transactionId || "Not available"}
                  </p>
                </div>

                <div className="mt-4">
                  <StatusBadge status={payment.status} />
                </div>

                <div className="mt-5">
                  <Link
                    to={`/patient/payments/${id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
                  >
                    <ReceiptText className="h-4 w-4" />
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

export default PatientPayments;
