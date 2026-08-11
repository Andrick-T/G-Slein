import {
  CalendarDays,
  CreditCard,
  FileText,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Card from "../../components/common/Card.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import api from "../../services/api.js";
import { formatAmount, formatDate, getEntityId } from "./adminUtils.js";

function AdminDashboard() {
  const [doctorCount, setDoctorCount] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          doctorResponse,
          appointmentResponse,
          paymentResponse,
          prescriptionResponse,
        ] = await Promise.all([
          api.get("/doctors"),
          api.get("/appointments"),
          api.get("/payments"),
          api.get("/prescriptions"),
        ]);

        const doctors = doctorResponse.data.doctors || [];
        const nextAppointments = appointmentResponse.data.appointments || [];
        const nextPayments = paymentResponse.data.payments || [];
        const nextPrescriptions = prescriptionResponse.data.prescriptions || [];

        const reviewResults = await Promise.all(
          doctors.map(async (doctor) => {
            const doctorId = getEntityId(doctor);

            if (!doctorId) {
              return [];
            }

            try {
              const response = await api.get(
                `/reviews/doctors/${doctorId}/reviews`,
              );
              return response.data.reviews || [];
            } catch {
              return [];
            }
          }),
        );

        if (!active) {
          return;
        }

        setDoctorCount(doctors.length);
        setAppointments(nextAppointments);
        setPayments(nextPayments);
        setPrescriptions(nextPrescriptions);
        setReviewCount(reviewResults.flat().length);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (requestError?.status === 403) {
          setError(
            "You do not have permission to access admin dashboard data.",
          );
        } else {
          setError(
            requestError.message || "Unable to load admin dashboard data.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const pendingAppointments = appointments.filter(
      (appointment) => appointment.status === "pending",
    ).length;

    const completedAppointments = appointments.filter(
      (appointment) => appointment.status === "completed",
    ).length;

    const paidPayments = payments.filter(
      (payment) => payment.status === "paid",
    ).length;

    const uniquePatientIds = new Set(
      appointments
        .map((appointment) => getEntityId(appointment.patient))
        .filter(Boolean),
    );

    return {
      doctorCount,
      appointmentCount: appointments.length,
      pendingAppointments,
      completedAppointments,
      paymentCount: payments.length,
      paidPayments,
      prescriptionCount: prescriptions.length,
      reviewCount,
      activePatients: uniquePatientIds.size,
    };
  }, [doctorCount, appointments, payments, prescriptions, reviewCount]);

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      })
      .slice(0, 4);
  }, [appointments]);

  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 4);
  }, [payments]);

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
          Admin overview
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          Platform operations dashboard
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Metrics are derived from existing backend endpoints without custom
          aggregation services.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm font-semibold text-[#64748B]">Doctors</p>
          <p className="mt-2 text-3xl font-bold text-[#0F172A]">
            {metrics.doctorCount}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-[#64748B]">Appointments</p>
          <p className="mt-2 text-3xl font-bold text-[#0F172A]">
            {metrics.appointmentCount}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            {metrics.pendingAppointments} pending ·{" "}
            {metrics.completedAppointments} completed
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-[#64748B]">Payments</p>
          <p className="mt-2 text-3xl font-bold text-[#0F172A]">
            {metrics.paymentCount}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            {metrics.paidPayments} paid
          </p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-[#64748B]">Reviews</p>
          <p className="mt-2 text-3xl font-bold text-[#0F172A]">
            {metrics.reviewCount}
          </p>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#64748B]">
              Prescriptions
            </p>
            <FileText className="h-4 w-4 text-[#0F766E]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#0F172A]">
            {metrics.prescriptionCount}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#64748B]">
              Patients in active data
            </p>
            <Users className="h-4 w-4 text-[#0F766E]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[#0F172A]">
            {metrics.activePatients}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            Derived from appointments (no dedicated admin users endpoint).
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#64748B]">
              Quick actions
            </p>
            <CalendarDays className="h-4 w-4 text-[#0F766E]" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to="/admin/appointments"
              className="inline-flex items-center justify-center rounded-lg bg-[#0F766E] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#115E59]"
            >
              Appointments
            </Link>
            <Link
              to="/admin/payments"
              className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#0F172A] transition hover:border-[#0F766E] hover:bg-[#F8FAFC] hover:text-[#0F766E]"
            >
              Payments
            </Link>
            <Link
              to="/admin/reviews"
              className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-3 py-2 text-xs font-semibold text-[#0F172A] transition hover:border-[#0F766E] hover:bg-[#F8FAFC] hover:text-[#0F766E]"
            >
              Reviews
            </Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#0F172A]">
              Recent appointments
            </h2>
            <CalendarDays className="h-5 w-5 text-[#0F766E]" />
          </div>

          <div className="mt-4 space-y-3">
            {recentAppointments.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
                No appointment activity available.
              </p>
            ) : (
              recentAppointments.map((appointment) => {
                const id = getEntityId(appointment);

                return (
                  <div
                    key={id}
                    className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                  >
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {appointment.patient?.firstName || "Patient"}{" "}
                      {appointment.patient?.lastName || ""} with Dr.{" "}
                      {appointment.doctor?.firstName || "Doctor"}{" "}
                      {appointment.doctor?.lastName || ""}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {formatDate(appointment.date)} · {appointment.startTime} -{" "}
                      {appointment.endTime}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge status={appointment.status} />
                      <StatusBadge status={appointment.paymentStatus} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#0F172A]">
              Recent payments
            </h2>
            <CreditCard className="h-5 w-5 text-[#0F766E]" />
          </div>

          <div className="mt-4 space-y-3">
            {recentPayments.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
                No payment activity available.
              </p>
            ) : (
              recentPayments.map((payment) => {
                const id = getEntityId(payment);

                return (
                  <div
                    key={id}
                    className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                  >
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {payment.patient?.firstName || "Patient"}{" "}
                      {payment.patient?.lastName || ""}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {formatAmount(payment.amount, payment.currency)} ·{" "}
                      {payment.provider || "simulated"}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={payment.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/users"
          className="rounded-xl border border-[#E2E8F0] bg-white p-4 text-sm font-semibold text-[#0F172A] transition hover:border-[#0F766E] hover:text-[#0F766E]"
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users overview
          </div>
        </Link>

        <Link
          to="/admin/doctors"
          className="rounded-xl border border-[#E2E8F0] bg-white p-4 text-sm font-semibold text-[#0F172A] transition hover:border-[#0F766E] hover:text-[#0F766E]"
        >
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Doctors directory
          </div>
        </Link>

        <Link
          to="/admin/reviews"
          className="rounded-xl border border-[#E2E8F0] bg-white p-4 text-sm font-semibold text-[#0F172A] transition hover:border-[#0F766E] hover:text-[#0F766E]"
        >
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Reviews oversight
          </div>
        </Link>
      </section>
    </div>
  );
}

export default AdminDashboard;
