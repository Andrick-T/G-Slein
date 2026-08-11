import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { CalendarDays, FileText, Phone, UserRound, Users } from "lucide-react";

import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(user);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const [profileResponse, appointmentsResponse] = await Promise.all([
          api.get("/users/me"),
          api.get("/appointments"),
        ]);

        if (!active) {
          return;
        }

        setCurrentUser(profileResponse.data.user);
        setAppointments(appointmentsResponse.data.appointments || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(requestError.message || "Unable to load your dashboard.");
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

  const upcomingAppointment = useMemo(() => {
    const upcoming = appointments.filter((appointment) => {
      return ["pending", "confirmed"].includes(appointment.status);
    });

    return upcoming[0] || null;
  }, [appointments]);

  const completedCount = appointments.filter((appointment) => {
    return appointment.status === "completed";
  }).length;

  const profileSummary = [
    {
      icon: UserRound,
      label: "Name",
      value:
        `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim() ||
        "Not provided",
    },
    {
      icon: FileText,
      label: "Email",
      value: currentUser?.email || "Not provided",
    },
    {
      icon: Phone,
      label: "Phone",
      value: currentUser?.phone || "Not provided",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" className="text-[#2563EB]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
            Patient Dashboard
          </h1>
          <p className="mt-2 text-[#64748B]">
            Here's your healthcare overview.
          </p>
        </header>

        <div
          className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]"
          role="alert"
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
            Patient overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            Good morning, {currentUser?.firstName || "there"}
          </h1>
          <p className="mt-2 text-sm text-[#64748B] sm:text-base">
            Here's your healthcare overview.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DBEAFE] text-[#1D4ED8]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Profile
            </p>
            <p className="text-sm font-semibold text-[#0F172A]">
              {currentUser?.firstName || "Patient"}{" "}
              {currentUser?.lastName || ""}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#64748B]">
                Upcoming appointment
              </p>
              <p className="mt-2 text-2xl font-bold text-[#0F172A]">
                {upcomingAppointment
                  ? formatDate(upcomingAppointment.date)
                  : "No appointment yet"}
              </p>
            </div>
            <CalendarDays className="h-6 w-6 text-[#2563EB]" />
          </div>

          {upcomingAppointment ? (
            <div className="mt-5 space-y-2 text-sm text-[#64748B]">
              <p className="font-semibold text-[#0F172A]">
                Dr. {upcomingAppointment.doctor?.firstName || "Your doctor"}{" "}
                {upcomingAppointment.doctor?.lastName || ""}
              </p>
              <p>
                {upcomingAppointment.startTime} - {upcomingAppointment.endTime}
              </p>
              <StatusBadge status={upcomingAppointment.status} />
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                title="No upcoming appointment"
                description="You do not have any scheduled consultations yet."
                actionLabel="View profile"
                onAction={() => navigate("/patient/profile")}
                Icon={CalendarDays}
              />
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#64748B]">
                Completed consultations
              </p>
              <p className="mt-2 text-3xl font-bold text-[#0F172A]">
                {completedCount}
              </p>
            </div>
            <FileText className="h-6 w-6 text-[#0D9488]" />
          </div>

          <p className="mt-5 text-sm leading-6 text-[#64748B]">
            Your appointments and follow-up information stay organized in one
            place.
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#64748B]">
                Profile summary
              </p>
              <p className="mt-2 text-3xl font-bold text-[#0F172A]">
                {profileSummary.length}
              </p>
            </div>
            <UserRound className="h-6 w-6 text-[#2563EB]" />
          </div>

          <p className="mt-5 text-sm leading-6 text-[#64748B]">
            Review your contact details and keep your account information up to
            date.
          </p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
                Upcoming / recent activity
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#0F172A]">
                Activity overview
              </h2>
            </div>
            <CalendarDays className="h-5 w-5 text-[#64748B]" />
          </div>

          <div className="mt-6">
            {appointments.length === 0 ? (
              <EmptyState
                title="No appointment activity yet"
                description="Once appointments are scheduled, they will appear here."
                actionLabel="View profile"
                onAction={() => navigate("/patient/profile")}
                Icon={CalendarDays}
              />
            ) : (
              <div className="space-y-3">
                {appointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-[#0F172A]">
                        Dr. {appointment.doctor?.firstName || "Your doctor"}{" "}
                        {appointment.doctor?.lastName || ""}
                      </p>
                      <p className="mt-1 text-sm text-[#64748B]">
                        {formatDate(appointment.date)} · {appointment.startTime}{" "}
                        - {appointment.endTime}
                      </p>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#1D4ED8]">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A]">
                  Profile summary
                </h2>
                <p className="text-sm text-[#64748B]">
                  Your current account details.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {profileSummary.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                >
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#64748B] shadow-sm">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#0F172A]">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <Link
                to="/patient/profile"
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                View / Edit Profile
              </Link>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#CCFBF1] text-[#0F766E]">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0F172A]">
                  Need to update contact details?
                </h2>
                <p className="text-sm text-[#64748B]">
                  Keep your profile current so your care team can reach you.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default PatientDashboard;
