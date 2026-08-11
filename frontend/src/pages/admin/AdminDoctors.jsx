import { Search, Stethoscope } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Input from "../../components/common/Input.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import api from "../../services/api.js";
import { formatDateTime, getEntityId, normalizeText } from "./adminUtils.js";

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDoctors = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/doctors");

        if (!active) {
          return;
        }

        setDoctors(response.data.doctors || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (requestError?.status === 403) {
          setError("You do not have permission to access doctor data.");
        } else {
          setError(requestError.message || "Unable to load doctors.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDoctors();

    return () => {
      active = false;
    };
  }, []);

  const filteredDoctors = useMemo(() => {
    const query = normalizeText(search);

    if (!query) {
      return doctors;
    }

    return doctors.filter((doctor) => {
      const fullName = normalizeText(
        `${doctor.firstName || ""} ${doctor.lastName || ""}`,
      );
      const specialization = normalizeText(
        doctor.doctorProfile?.specialization,
      );
      const email = normalizeText(doctor.email);

      return (
        fullName.includes(query) ||
        specialization.includes(query) ||
        email.includes(query)
      );
    });
  }, [doctors, search]);

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
          Doctors
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          Doctor management overview
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Review registered doctors and open detailed professional profiles.
        </p>
      </header>

      <Card>
        <Input
          id="admin-doctor-search"
          name="admin-doctor-search"
          label="Search doctors"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, specialization, or email"
          inputClassName="pl-10"
        />
        <Search className="pointer-events-none -mt-[2.85rem] ml-3 h-4 w-4 text-[#94A3B8]" />
      </Card>

      {doctors.length === 0 ? (
        <EmptyState
          title="No doctors found"
          description="No doctor accounts were returned by the current API."
          Icon={Stethoscope}
        />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          title="No matching doctors"
          description="Try adjusting your search query."
          Icon={Search}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDoctors.map((doctor) => {
            const doctorId = getEntityId(doctor);
            const fullName =
              `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim();

            return (
              <Card key={doctorId} className="h-full" padding="compact">
                <h2 className="text-base font-semibold text-[#0F172A]">
                  Dr. {fullName || "Unknown"}
                </h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  {doctor.doctorProfile?.specialization ||
                    "Specialization unavailable"}
                </p>

                <div className="mt-3 space-y-1.5 text-sm text-[#64748B]">
                  <p className="break-all">{doctor.email || "No email"}</p>
                  <p>{doctor.phone || "No phone"}</p>
                  <p>
                    Experience:{" "}
                    {Number.isFinite(doctor.doctorProfile?.experience)
                      ? `${doctor.doctorProfile.experience} years`
                      : "Not available"}
                  </p>
                  <p>Created: {formatDateTime(doctor.createdAt)}</p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      doctor.doctorProfile?.isVerified
                        ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#166534]"
                        : "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]"
                    }`}
                  >
                    {doctor.doctorProfile?.isVerified
                      ? "Verified"
                      : "Not verified"}
                  </span>
                </div>

                <div className="mt-4">
                  <Link
                    to={`/admin/doctors/${doctorId}`}
                    className="inline-flex items-center justify-center rounded-lg bg-[#0F766E] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#115E59]"
                  >
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

export default AdminDoctors;
