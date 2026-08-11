import { Search, Stethoscope, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Input from "../../components/common/Input.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import api from "../../services/api.js";

const getDoctorName = (doctor) => {
  if (!doctor) {
    return "Unknown Doctor";
  }

  return `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim();
};

function PatientDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchName, setSearchName] = useState("");
  const [searchSpecialization, setSearchSpecialization] = useState("");

  const [query, setQuery] = useState({
    name: "",
    specialization: "",
  });

  useEffect(() => {
    let active = true;

    const loadDoctors = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (query.name) {
          params.set("name", query.name);
        }

        if (query.specialization) {
          params.set("specialization", query.specialization);
        }

        const endpoint = params.toString()
          ? `/doctors?${params.toString()}`
          : "/doctors";

        const response = await api.get(endpoint);

        if (!active) {
          return;
        }

        setDoctors(response.data.doctors || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        setError(requestError.message || "Unable to load doctors right now.");
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
  }, [query]);

  const specializationOptions = useMemo(() => {
    const values = doctors
      .map((doctor) => doctor?.doctorProfile?.specialization?.trim())
      .filter(Boolean);

    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [doctors]);

  const handleSearch = (event) => {
    event.preventDefault();

    setQuery({
      name: searchName.trim(),
      specialization: searchSpecialization.trim(),
    });
  };

  const handleReset = () => {
    setSearchName("");
    setSearchSpecialization("");
    setQuery({
      name: "",
      specialization: "",
    });
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
            Doctor discovery
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
            Find the right doctor for your consultation
          </h1>
          <p className="mt-2 text-sm text-[#64748B] sm:text-base">
            Browse available doctors and open a full profile before booking.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_220px_auto]"
        >
          <Input
            id="doctorName"
            name="doctorName"
            label="Search by name"
            placeholder="e.g. Sarah"
            value={searchName}
            onChange={(event) => setSearchName(event.target.value)}
          />

          <div>
            <label
              htmlFor="specialization"
              className="mb-2 block text-sm font-semibold text-[#0F172A]"
            >
              Specialization
            </label>

            <select
              id="specialization"
              value={searchSpecialization}
              onChange={(event) => setSearchSpecialization(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm outline-none transition-all duration-200 hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-4 focus:ring-[#DBEAFE]"
            >
              <option value="">All specializations</option>
              {specializationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <Button type="submit" className="w-full sm:w-auto">
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>
        </form>
      </header>

      {loading ? (
        <div className="flex min-h-[36vh] items-center justify-center">
          <Spinner size="lg" className="text-[#2563EB]" />
        </div>
      ) : null}

      {!loading && error ? (
        <div
          role="alert"
          className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]"
        >
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        doctors.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => {
              const fullName = getDoctorName(doctor);
              const profile = doctor.doctorProfile || {};

              return (
                <Card key={doctor.id} hover className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DBEAFE] text-[#1D4ED8]">
                        <UserRound className="h-6 w-6" aria-hidden="true" />
                      </div>

                      <div>
                        <p className="text-lg font-semibold text-[#0F172A]">
                          Dr. {fullName || "Unknown"}
                        </p>
                        <p className="text-sm text-[#0D9488]">
                          {profile.specialization || "General Medicine"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#64748B]">
                    <p>
                      <span className="font-semibold text-[#334155]">
                        Experience:
                      </span>{" "}
                      {Number.isFinite(profile.experience)
                        ? `${profile.experience} years`
                        : "Not specified"}
                    </p>
                    <p>
                      <span className="font-semibold text-[#334155]">
                        Consultation fee:
                      </span>{" "}
                      {Number.isFinite(profile.consultationFee)
                        ? `$${profile.consultationFee}`
                        : "Not specified"}
                    </p>
                    <p>
                      <span className="font-semibold text-[#334155]">
                        Languages:
                      </span>{" "}
                      {Array.isArray(profile.languages) &&
                      profile.languages.length > 0
                        ? profile.languages.join(", ")
                        : "Not specified"}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-[#E2E8F0] pt-4">
                    <Link
                      to={`/patient/doctors/${doctor.id}`}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                    >
                      View profile
                    </Link>
                  </div>
                </Card>
              );
            })}
          </section>
        ) : (
          <EmptyState
            title="No doctors are available right now"
            description="Try clearing your filters or check again shortly."
            actionLabel="Clear search"
            onAction={handleReset}
            Icon={Stethoscope}
          />
        )
      ) : null}
    </div>
  );
}

export default PatientDoctors;
