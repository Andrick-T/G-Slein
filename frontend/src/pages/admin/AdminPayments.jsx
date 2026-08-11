import { CreditCard, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Input from "../../components/common/Input.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import api from "../../services/api.js";
import {
  formatAmount,
  formatDateTime,
  getEntityId,
  normalizeText,
} from "./adminUtils.js";

const paymentStatusOptions = ["all", "pending", "paid", "failed", "refunded"];

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    let active = true;

    const loadPayments = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/payments");

        if (!active) {
          return;
        }

        setPayments(response.data.payments || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (requestError?.status === 403) {
          setError("You do not have permission to access payment data.");
        } else {
          setError(requestError.message || "Unable to load payments.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPayments();

    return () => {
      active = false;
    };
  }, []);

  const filteredPayments = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return payments.filter((payment) => {
      const patientName = normalizeText(
        `${payment.patient?.firstName || ""} ${payment.patient?.lastName || ""}`,
      );
      const doctorName = normalizeText(
        `${payment.doctor?.firstName || ""} ${payment.doctor?.lastName || ""}`,
      );
      const provider = normalizeText(payment.provider);
      const transactionId = normalizeText(payment.transactionId);

      const matchesQuery =
        !normalizedQuery ||
        patientName.includes(normalizedQuery) ||
        doctorName.includes(normalizedQuery) ||
        provider.includes(normalizedQuery) ||
        transactionId.includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" ||
        normalizeText(payment.status) === normalizeText(statusFilter);

      return matchesQuery && matchesStatus;
    });
  }, [payments, query, statusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" className="text-[#0F766E]" />
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
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
          Payments
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          Payment oversight
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Read-only monitoring of payment status and transaction metadata.
        </p>
      </header>

      <Card>
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <Input
              id="admin-payment-search"
              name="admin-payment-search"
              label="Search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by patient, doctor, provider, or transaction ID"
              inputClassName="pl-10"
            />
            <Search className="pointer-events-none -mt-[2.85rem] ml-3 h-4 w-4 text-[#94A3B8]" />
          </div>

          <div>
            <label
              htmlFor="admin-payment-status"
              className="mb-2 block text-sm font-semibold text-[#0F172A]"
            >
              Status
            </label>
            <select
              id="admin-payment-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full min-h-11 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm outline-none transition-all duration-200 hover:border-[#CBD5E1] focus:border-[#0F766E] focus:ring-4 focus:ring-[#CCFBF1]"
            >
              {paymentStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all"
                    ? "All statuses"
                    : option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {payments.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="No payment records were returned by the API."
          Icon={CreditCard}
        />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          title="No matching payments"
          description="Try adjusting your search or status filter."
          Icon={Search}
        />
      ) : (
        <section className="space-y-4">
          {filteredPayments.map((payment) => {
            const paymentId = getEntityId(payment);
            const appointmentId = getEntityId(payment.appointment);

            return (
              <Card key={paymentId}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-[#0F172A]">
                      {payment.patient?.firstName || "Patient"}{" "}
                      {payment.patient?.lastName || ""}
                    </h2>
                    <p className="mt-1 text-sm text-[#64748B]">
                      Dr. {payment.doctor?.firstName || "Doctor"}{" "}
                      {payment.doctor?.lastName || ""}
                    </p>
                    <p className="mt-1 text-sm text-[#64748B]">
                      {formatAmount(payment.amount, payment.currency)}
                    </p>
                  </div>

                  <StatusBadge status={payment.status} />
                </div>

                <div className="mt-3 grid gap-2 text-sm text-[#64748B] sm:grid-cols-2">
                  <p>Provider: {payment.provider || "simulated"}</p>
                  <p className="break-all">
                    Transaction ID: {payment.transactionId || "Not available"}
                  </p>
                  <p>Date: {formatDateTime(payment.createdAt)}</p>
                  <p>Appointment ID: {appointmentId || "Not available"}</p>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default AdminPayments;
