import { CalendarDays, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Input from "../../components/common/Input.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import api from "../../services/api.js";
import { formatDate, getEntityId, normalizeText } from "./adminUtils.js";

const statusOptions = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
];

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

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
          setError("You do not have permission to access appointments.");
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

  const filteredAppointments = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return appointments.filter((appointment) => {
      const patientName = normalizeText(
        `${appointment.patient?.firstName || ""} ${appointment.patient?.lastName || ""}`,
      );
      const doctorName = normalizeText(
        `${appointment.doctor?.firstName || ""} ${appointment.doctor?.lastName || ""}`,
      );
      const reason = normalizeText(appointment.reason);
      const status = normalizeText(appointment.status);
      const dateKey = appointment.date
        ? new Date(appointment.date).toISOString().slice(0, 10)
        : "";

      const matchesQuery =
        !normalizedQuery ||
        patientName.includes(normalizedQuery) ||
        doctorName.includes(normalizedQuery) ||
        reason.includes(normalizedQuery);

      const matchesStatus =
        statusFilter === "all" || status === normalizeText(statusFilter);

      const matchesDate = !dateFilter || dateFilter === dateKey;

      return matchesQuery && matchesStatus && matchesDate;
    });
  }, [appointments, query, statusFilter, dateFilter]);

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
          Appointments
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          Appointment oversight
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Administrative view of consultation scheduling and status progress.
        </p>
      </header>

      <Card>
        <div className="grid gap-4 lg:grid-cols-[1fr_200px_180px]">
          <div>
            <Input
              id="admin-appointment-search"
              name="admin-appointment-search"
              label="Search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by patient, doctor, or reason"
              inputClassName="pl-10"
            />
            <Search className="pointer-events-none -mt-[2.85rem] ml-3 h-4 w-4 text-[#94A3B8]" />
          </div>

          <div>
            <label
              htmlFor="admin-appointment-status"
              className="mb-2 block text-sm font-semibold text-[#0F172A]"
            >
              Status
            </label>
            <select
              id="admin-appointment-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full min-h-11 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm outline-none transition-all duration-200 hover:border-[#CBD5E1] focus:border-[#0F766E] focus:ring-4 focus:ring-[#CCFBF1]"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all"
                    ? "All statuses"
                    : option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <Input
            id="admin-appointment-date"
            name="admin-appointment-date"
            label="Date"
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />
        </div>
      </Card>

      {appointments.length === 0 ? (
        <EmptyState
          title="No appointments found"
          description="The appointments endpoint returned no records."
          Icon={CalendarDays}
        />
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          title="No matching appointments"
          description="Try adjusting your filters."
          Icon={Search}
        />
      ) : (
        <section className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const appointmentId = getEntityId(appointment);

            return (
              <Card key={appointmentId}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-[#0F172A]">
                      {appointment.patient?.firstName || "Patient"}{" "}
                      {appointment.patient?.lastName || ""} with Dr.{" "}
                      {appointment.doctor?.firstName || "Doctor"}{" "}
                      {appointment.doctor?.lastName || ""}
                    </h2>
                    <p className="mt-1 text-sm text-[#64748B]">
                      {formatDate(appointment.date)} · {appointment.startTime} -{" "}
                      {appointment.endTime}
                    </p>
                    <p className="mt-1 text-sm text-[#64748B]">
                      {appointment.consultationType || "video"}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#64748B]">
                      {appointment.reason || "No reason provided."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={appointment.status} />
                    <StatusBadge status={appointment.paymentStatus} />
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-[#64748B] sm:grid-cols-2">
                  <p className="break-all">
                    Patient email: {appointment.patient?.email || "Unavailable"}
                  </p>
                  <p className="break-all">
                    Doctor email: {appointment.doctor?.email || "Unavailable"}
                  </p>
                  <p>Appointment ID: {appointmentId || "Unavailable"}</p>
                  <p>
                    Session status: {appointment.sessionStatus || "not_started"}
                  </p>
                </div>
              </Card>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default AdminAppointments;
