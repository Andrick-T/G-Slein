import { CreditCard, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import PaymentDrawer from "../../components/payment/PaymentDrawer.jsx";
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
  const location = useLocation();

  const [payments, setPayments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingAppointmentId, setPayingAppointmentId] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkingReturnStatus, setCheckingReturnStatus] = useState(false);
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

    const checkReturnedPaymentState = async () => {
      const query = new URLSearchParams(location.search);
      const status = query.get("payment");
      const appointmentId = query.get("appointmentId");

      if (status === "cancelled") {
        setActionError("Payment was cancelled before completion.");
        return;
      }

      if (status !== "processing" || !appointmentId) {
        return;
      }

      setActionError("");
      setActionSuccess("Checking payment status...");
      setCheckingReturnStatus(true);

      const attempts = 6;

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        if (!active) {
          return;
        }

        try {
          const appointmentResponse = await api.get(
            `/appointments/${appointmentId}`,
          );
          const appointment = appointmentResponse?.data?.appointment;

          if (appointment?.paymentStatus === "paid") {
            await loadData();

            if (!active) {
              return;
            }

            setActionSuccess(
              "Payment confirmed by backend. Your appointment is now marked as paid.",
            );
            setCheckingReturnStatus(false);
            return;
          }
        } catch {
          // Continue short polling window before showing fallback guidance.
        }

        if (attempt < attempts - 1) {
          await new Promise((resolve) => {
            window.setTimeout(resolve, 2500);
          });
        }
      }

      if (!active) {
        return;
      }

      await loadData();
      setActionSuccess(
        "Payment is still processing. Refresh shortly to see the updated backend status.",
      );
      setCheckingReturnStatus(false);
    };

    checkReturnedPaymentState();

    return () => {
      active = false;
    };
  }, [location.search]);

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

  const handleStripeCheckout = async (appointment) => {
    setActionError("");
    setActionSuccess("");
    setPayingAppointmentId(appointment._id || appointment.id);

    const appointmentId = appointment._id || appointment.id;
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
      const response = await api.post("/payments/stripe/checkout-session", {
        appointmentId,
      });

      const sessionUrl = response?.data?.session?.url;

      if (!sessionUrl) {
        throw new Error("Stripe checkout session URL was not returned.");
      }

      window.location.href = sessionUrl;
    } catch (requestError) {
      if (requestError?.status === 409) {
        setActionError(
          requestError.message ||
            "A payment is already in progress or has already been paid for this appointment.",
        );
      } else if (requestError?.status === 400) {
        setActionError(requestError.message || "Unable to process payment.");
      } else if (requestError?.status === 403) {
        setActionError("You are not authorized to pay for this appointment.");
      } else {
        setActionError(requestError.message || "Payment request failed.");
      }
    } finally {
      setPayingAppointmentId("");
    }
  };

  const formatAmount = (value, currency = "XAF") => {
    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
      return "Not available";
    }

    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
              Payments
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              Payment history
            </h1>
            <p className="mt-2 text-sm text-[#64748B] sm:text-base">
              Track appointment payments and complete pending consultation
              payments.
            </p>
          </div>

          <Link
            to="/patient"
            className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
          >
            Back to dashboard
          </Link>
        </div>
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
          <div className="flex items-center gap-2">
            {checkingReturnStatus ? (
              <Spinner size="sm" className="text-[#0F766E]" />
            ) : null}
            <span>{actionSuccess}</span>
          </div>
        </div>
      ) : null}

      <Card>
        <h2 className="text-lg font-semibold text-[#0F172A]">
          Pending payments
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Payments are processed through Stripe Checkout and confirmed by the
          backend webhook.
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
                        Amount: {formatAmount(fee, "XAF")}
                      </p>
                    </div>

                    <Button
                      type="button"
                      disabled={
                        payingAppointmentId === appointmentId || fee <= 0
                      }
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setDrawerOpen(true);
                        setActionError("");
                      }}
                    >
                      Complete payment
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
                    {formatAmount(payment.amount, payment.currency || "XAF")}
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

      <PaymentDrawer
        open={drawerOpen}
        appointment={selectedAppointment}
        loading={
          Boolean(selectedAppointment) &&
          payingAppointmentId ===
            (selectedAppointment?._id || selectedAppointment?.id)
        }
        error={actionError}
        onClose={() => {
          if (!payingAppointmentId) {
            setDrawerOpen(false);
            setSelectedAppointment(null);
          }
        }}
        onConfirm={async (appointment) => {
          await handleStripeCheckout(appointment);
        }}
      />
    </div>
  );
}

export default PatientPayments;
