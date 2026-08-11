import { Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Input from "../../components/common/Input.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import api from "../../services/api.js";
import { formatDate, getEntityId, normalizeText } from "./adminUtils.js";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    let active = true;

    const loadReviews = async () => {
      setLoading(true);
      setError("");

      try {
        const [doctorsResponse, appointmentsResponse] = await Promise.all([
          api.get("/doctors"),
          api.get("/appointments"),
        ]);

        const doctors = doctorsResponse.data.doctors || [];
        const appointments = appointmentsResponse.data.appointments || [];
        const appointmentMap = new Map();

        appointments.forEach((appointment) => {
          const appointmentId = getEntityId(appointment);

          if (appointmentId) {
            appointmentMap.set(appointmentId, appointment);
          }
        });

        const reviewSets = await Promise.all(
          doctors.map(async (doctor) => {
            const doctorId = getEntityId(doctor);

            if (!doctorId) {
              return [];
            }

            try {
              const response = await api.get(
                `/reviews/doctors/${doctorId}/reviews`,
              );
              const doctorReviews = response.data.reviews || [];

              return doctorReviews.map((review) => {
                const linkedAppointment = appointmentMap.get(
                  getEntityId(review.appointment) || review.appointment,
                );

                return {
                  ...review,
                  doctor: response.data.doctor || doctor,
                  linkedAppointment: linkedAppointment || null,
                };
              });
            } catch {
              return [];
            }
          }),
        );

        if (!active) {
          return;
        }

        const combined = reviewSets
          .flat()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setReviews(combined);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (requestError?.status === 403) {
          setError("You do not have permission to access review oversight.");
        } else {
          setError(requestError.message || "Unable to load review activity.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      active = false;
    };
  }, []);

  const filteredReviews = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    return reviews.filter((review) => {
      const doctorName = normalizeText(
        `${review.doctor?.firstName || ""} ${review.doctor?.lastName || ""}`,
      );
      const patientName = normalizeText(
        `${review.patient?.firstName || ""} ${review.patient?.lastName || ""}`,
      );
      const comment = normalizeText(review.comment);

      const matchesQuery =
        !normalizedQuery ||
        doctorName.includes(normalizedQuery) ||
        patientName.includes(normalizedQuery) ||
        comment.includes(normalizedQuery);

      const matchesRating =
        ratingFilter === "all" || String(review.rating) === ratingFilter;

      return matchesQuery && matchesRating;
    });
  }, [reviews, query, ratingFilter]);

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
          Reviews
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          Review oversight
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Aggregated read-only review stream derived from existing per-doctor
          review endpoints.
        </p>
      </header>

      <Card>
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          <div>
            <Input
              id="admin-review-search"
              name="admin-review-search"
              label="Search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by doctor, patient, or comment"
              inputClassName="pl-10"
            />
            <Search className="pointer-events-none -mt-[2.85rem] ml-3 h-4 w-4 text-[#94A3B8]" />
          </div>

          <div>
            <label
              htmlFor="admin-review-rating"
              className="mb-2 block text-sm font-semibold text-[#0F172A]"
            >
              Rating
            </label>
            <select
              id="admin-review-rating"
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
              className="w-full min-h-11 rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm outline-none transition-all duration-200 hover:border-[#CBD5E1] focus:border-[#0F766E] focus:ring-4 focus:ring-[#CCFBF1]"
            >
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>
        </div>
      </Card>

      {reviews.length === 0 ? (
        <EmptyState
          title="No reviews found"
          description="No review records were returned by doctor review endpoints."
          Icon={Star}
        />
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          title="No matching reviews"
          description="Try a different search term or rating filter."
          Icon={Search}
        />
      ) : (
        <section className="space-y-4">
          {filteredReviews.map((review) => {
            const reviewId = getEntityId(review);
            const stars = Number.isFinite(review.rating)
              ? `${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`
              : "Not rated";

            return (
              <Card key={reviewId}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-[#0F172A]">
                      Dr. {review.doctor?.firstName || "Doctor"}{" "}
                      {review.doctor?.lastName || ""}
                    </h2>
                    <p className="mt-1 text-sm text-[#64748B]">
                      Patient: {review.patient?.firstName || "Patient"}{" "}
                      {review.patient?.lastName || ""}
                    </p>
                    <p className="mt-1 text-sm text-[#64748B]">{stars}</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#475569]">
                      {review.comment || "No comment provided."}
                    </p>
                  </div>

                  <StatusBadge status={`${review.rating || 0} star`} />
                </div>

                <div className="mt-3 grid gap-2 text-sm text-[#64748B] sm:grid-cols-2">
                  <p>Date: {formatDate(review.createdAt)}</p>
                  <p>Review ID: {reviewId || "Unavailable"}</p>
                  <p className="sm:col-span-2">
                    Appointment:{" "}
                    {review.linkedAppointment
                      ? `${formatDate(review.linkedAppointment.date)} · ${review.linkedAppointment.startTime} - ${review.linkedAppointment.endTime}`
                      : "Appointment details unavailable from current review contract."}
                  </p>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-4 text-sm text-[#92400E]">
        Backend limitation: there is no dedicated global admin reviews endpoint,
        so this page aggregates reviews through per-doctor review APIs.
      </div>
    </div>
  );
}

export default AdminReviews;
