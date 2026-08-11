import { Mail, Phone, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Input from "../../components/common/Input.jsx";
import Spinner from "../../components/common/Spinner.jsx";
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

function DoctorPatients() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError("You are not authorized to access doctor patient data.");
        } else {
          setError(requestError.message || "Unable to load patient data.");
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

  const patients = useMemo(() => {
    const byId = new Map();

    appointments.forEach((appointment) => {
      const patient = appointment.patient;
      const patientId = patient?._id || patient?.id;

      if (!patient || !patientId) {
        return;
      }

      const current = byId.get(patientId);

      const appointmentDate = new Date(appointment.date);
      const appointmentTime = appointment.startTime || "00:00";
      const appointmentDateTime = Number.isNaN(appointmentDate.getTime())
        ? new Date(0)
        : new Date(
            `${appointmentDate.toISOString().slice(0, 10)}T${appointmentTime}:00`,
          );

      if (!current) {
        byId.set(patientId, {
          id: patientId,
          firstName: patient.firstName || "",
          lastName: patient.lastName || "",
          email: patient.email || "",
          phone: patient.phone || "",
          appointmentCount: 1,
          lastAppointmentDate: appointment.date,
          lastAppointmentDateTime: appointmentDateTime,
        });

        return;
      }

      current.appointmentCount += 1;

      if (
        Number.isFinite(appointmentDateTime.getTime()) &&
        appointmentDateTime > current.lastAppointmentDateTime
      ) {
        current.lastAppointmentDate = appointment.date;
        current.lastAppointmentDateTime = appointmentDateTime;
      }
    });

    return Array.from(byId.values()).sort((a, b) => {
      return b.lastAppointmentDateTime - a.lastAppointmentDateTime;
    });
  }, [appointments]);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return patients;
    }

    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();

      return (
        fullName.includes(query) ||
        patient.email.toLowerCase().includes(query) ||
        patient.phone.toLowerCase().includes(query)
      );
    });
  }, [patients, search]);

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
          Patients
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          My patients
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Patients associated with your appointments.
        </p>
      </header>

      <Card>
        <Input
          id="patient-search"
          name="patient-search"
          label="Search patients"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email, or phone"
          inputClassName="pl-10"
        />
        <Search className="pointer-events-none -mt-[2.85rem] ml-3 h-4 w-4 text-[#94A3B8]" />
      </Card>

      {patients.length === 0 ? (
        <EmptyState
          title="No patients found"
          description="Patients will appear here once appointments are assigned to you."
          Icon={Users}
        />
      ) : filteredPatients.length === 0 ? (
        <EmptyState
          title="No matching patients"
          description="Try a different search term."
          Icon={Search}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPatients.map((patient) => {
            const fullName =
              `${patient.firstName || "Patient"} ${patient.lastName || ""}`.trim();

            return (
              <Card key={patient.id} className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-[#0F172A]">
                      {fullName}
                    </h2>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Last appointment:{" "}
                      {formatDate(patient.lastAppointmentDate)}
                    </p>
                  </div>

                  <span className="inline-flex shrink-0 rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8]">
                    {patient.appointmentCount} appt
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-[#64748B]">
                  <p className="inline-flex items-center gap-2 break-all">
                    <Mail className="h-4 w-4 text-[#2563EB]" />
                    {patient.email || "No email provided"}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#2563EB]" />
                    {patient.phone || "No phone provided"}
                  </p>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      <div className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-4 text-sm text-[#1D4ED8]">
        This patient list is derived from your appointment data because there is
        no dedicated doctor-patients endpoint.
      </div>

      <div>
        <Link
          to="/doctor/appointments"
          className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
        >
          View appointments
        </Link>
      </div>
    </div>
  );
}

export default DoctorPatients;
