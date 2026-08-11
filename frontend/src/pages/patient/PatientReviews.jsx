import { MessageSquare, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Button from "../../components/common/Button.jsx";
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

const StarRatingInput = ({ value, onChange, disabled = false, idPrefix }) => {
  return (
    <div
      role="radiogroup"
      aria-label="Rating"
      className="flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={`${idPrefix}-star-${star}`}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          disabled={disabled}
          onClick={() => onChange(star)}
          className="rounded-md p-1.5 text-[#94A3B8] transition hover:text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Star
            className={`h-5 w-5 ${
              star <= value ? "fill-amber-400 text-amber-500" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
};

function PatientReviews() {
  const [appointments, setAppointments] = useState([]);
  const [reviewsByAppointmentId, setReviewsByAppointmentId] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [submittingId, setSubmittingId] = useState("");
  const [editingReviewId, setEditingReviewId] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState("");
  const [drafts, setDrafts] = useState({});
  const [currentUserId, setCurrentUserId] = useState("");

  const loadData = async () => {
    const [appointmentsResponse, meResponse] = await Promise.all([
      api.get("/appointments"),
      api.get("/auth/me"),
    ]);

    const nextAppointments = appointmentsResponse.data.appointments || [];
    const me = meResponse.data.user || {};

    setAppointments(nextAppointments);
    setCurrentUserId(me._id || me.id || "");

    const completedAppointments = nextAppointments.filter(
      (appointment) => appointment.status === "completed",
    );

    const doctorIds = [
      ...new Set(
        completedAppointments
          .map(
            (appointment) => appointment.doctor?._id || appointment.doctor?.id,
          )
          .filter(Boolean),
      ),
    ];

    const reviewsMap = {};

    await Promise.all(
      doctorIds.map(async (doctorId) => {
        const response = await api.get(`/reviews/doctors/${doctorId}/reviews`);
        const doctorReviews = response.data.reviews || [];

        doctorReviews.forEach((review) => {
          const appointmentId = review.appointment;
          const patientId = review.patient?._id || review.patient?.id;

          if (appointmentId && patientId && patientId === (me._id || me.id)) {
            reviewsMap[appointmentId] = review;
          }
        });
      }),
    );

    setReviewsByAppointmentId(reviewsMap);
  };

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [appointmentsResponse, meResponse] = await Promise.all([
          api.get("/appointments"),
          api.get("/auth/me"),
        ]);

        if (!active) {
          return;
        }

        const nextAppointments = appointmentsResponse.data.appointments || [];
        const me = meResponse.data.user || {};

        setAppointments(nextAppointments);
        setCurrentUserId(me._id || me.id || "");

        const completedAppointments = nextAppointments.filter(
          (appointment) => appointment.status === "completed",
        );

        const doctorIds = [
          ...new Set(
            completedAppointments
              .map(
                (appointment) =>
                  appointment.doctor?._id || appointment.doctor?.id,
              )
              .filter(Boolean),
          ),
        ];

        const reviewsMap = {};

        await Promise.all(
          doctorIds.map(async (doctorId) => {
            const response = await api.get(
              `/reviews/doctors/${doctorId}/reviews`,
            );
            const doctorReviews = response.data.reviews || [];

            doctorReviews.forEach((review) => {
              const appointmentId = review.appointment;
              const patientId = review.patient?._id || review.patient?.id;

              if (
                appointmentId &&
                patientId &&
                patientId === (me._id || me.id)
              ) {
                reviewsMap[appointmentId] = review;
              }
            });
          }),
        );

        if (!active) {
          return;
        }

        setReviewsByAppointmentId(reviewsMap);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (requestError?.status === 403) {
          setError("You are not authorized to access review data.");
        } else {
          setError(requestError.message || "Unable to load reviews.");
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

  const completedAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.status === "completed",
    );
  }, [appointments]);

  const getDraft = (appointmentId) => {
    return (
      drafts[appointmentId] || {
        rating: 5,
        comment: "",
      }
    );
  };

  const setDraft = (appointmentId, nextDraft) => {
    setDrafts((current) => ({
      ...current,
      [appointmentId]: nextDraft,
    }));
  };

  const handleCreateReview = async (appointmentId) => {
    const draft = getDraft(appointmentId);

    setActionError("");
    setActionSuccess("");
    setSubmittingId(appointmentId);

    try {
      const response = await api.post("/reviews", {
        appointment: appointmentId,
        rating: Number(draft.rating),
        comment: draft.comment?.trim() || undefined,
      });

      const createdReview = response.data.review;

      setReviewsByAppointmentId((current) => ({
        ...current,
        [appointmentId]: createdReview,
      }));
      setActionSuccess("Review submitted successfully.");
    } catch (requestError) {
      if (requestError?.status === 409) {
        setActionError(
          requestError.message ||
            "A review already exists for this appointment.",
        );
      } else if (requestError?.status === 400) {
        setActionError(
          requestError.message || "Please check your review details.",
        );
      } else {
        setActionError(requestError.message || "Unable to submit review.");
      }
    } finally {
      setSubmittingId("");
    }
  };

  const handleUpdateReview = async (appointmentId, reviewId) => {
    const draft = getDraft(appointmentId);

    setActionError("");
    setActionSuccess("");
    setEditingReviewId(reviewId);

    try {
      const response = await api.patch(`/reviews/${reviewId}`, {
        rating: Number(draft.rating),
        comment: draft.comment?.trim() || undefined,
      });

      const updatedReview = response.data.review;

      setReviewsByAppointmentId((current) => ({
        ...current,
        [appointmentId]: updatedReview,
      }));
      setActionSuccess("Review updated successfully.");
    } catch (requestError) {
      if (requestError?.status === 400) {
        setActionError(
          requestError.message || "Please check your review details.",
        );
      } else {
        setActionError(requestError.message || "Unable to update review.");
      }
    } finally {
      setEditingReviewId("");
    }
  };

  const handleDeleteReview = async (appointmentId, reviewId) => {
    setActionError("");
    setActionSuccess("");
    setDeletingReviewId(reviewId);

    try {
      await api.delete(`/reviews/${reviewId}`);

      setReviewsByAppointmentId((current) => {
        const next = { ...current };
        delete next[appointmentId];
        return next;
      });
      setActionSuccess("Review deleted successfully.");
    } catch (requestError) {
      setActionError(requestError.message || "Unable to delete review.");
    } finally {
      setDeletingReviewId("");
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
          Reviews
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          Your doctor reviews
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Share feedback for completed consultations.
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

      {completedAppointments.length === 0 ? (
        <EmptyState
          title="No completed appointments yet"
          description="You can leave reviews after completed consultations."
          Icon={MessageSquare}
        />
      ) : (
        <section className="space-y-4">
          {completedAppointments.map((appointment) => {
            const appointmentId = appointment._id || appointment.id;
            const review = reviewsByAppointmentId[appointmentId] || null;
            const draft = review
              ? {
                  rating: review.rating,
                  comment: review.comment || "",
                }
              : getDraft(appointmentId);

            const reviewId = review?._id || review?.id || "";

            return (
              <Card key={appointmentId}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0F172A]">
                      Dr. {appointment.doctor?.firstName || "Doctor"}{" "}
                      {appointment.doctor?.lastName || ""}
                    </h2>
                    <p className="mt-1 text-sm text-[#0D9488]">
                      {appointment.doctor?.doctorProfile?.specialization ||
                        "Specialization not specified"}
                    </p>
                    <p className="mt-1 text-sm text-[#64748B]">
                      {formatDate(appointment.date)} · {appointment.startTime} -{" "}
                      {appointment.endTime}
                    </p>
                  </div>

                  {review ? (
                    <span className="inline-flex rounded-full border border-[#CCFBF1] bg-[#F0FDFA] px-3 py-1 text-xs font-semibold text-[#0F766E]">
                      Review submitted
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
                      Pending review
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-[#0F172A]">
                      Rating
                    </p>
                    <StarRatingInput
                      idPrefix={appointmentId}
                      value={draft.rating}
                      onChange={(nextRating) =>
                        setDraft(appointmentId, {
                          ...draft,
                          rating: nextRating,
                        })
                      }
                      disabled={
                        submittingId === appointmentId ||
                        (Boolean(reviewId) && editingReviewId === reviewId) ||
                        (Boolean(reviewId) && deletingReviewId === reviewId)
                      }
                    />
                  </div>

                  <Input
                    id={`review-comment-${appointmentId}`}
                    name={`review-comment-${appointmentId}`}
                    label="Comment"
                    value={draft.comment}
                    onChange={(event) =>
                      setDraft(appointmentId, {
                        ...draft,
                        comment: event.target.value,
                      })
                    }
                    placeholder="Share your experience"
                  />

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    {review ? (
                      <>
                        <Button
                          type="button"
                          variant="danger"
                          loading={deletingReviewId === reviewId}
                          disabled={
                            deletingReviewId === reviewId ||
                            editingReviewId === reviewId
                          }
                          onClick={() =>
                            handleDeleteReview(appointmentId, reviewId)
                          }
                        >
                          Delete review
                        </Button>
                        <Button
                          type="button"
                          loading={editingReviewId === reviewId}
                          disabled={
                            editingReviewId === reviewId ||
                            deletingReviewId === reviewId
                          }
                          onClick={() =>
                            handleUpdateReview(appointmentId, reviewId)
                          }
                        >
                          Update review
                        </Button>
                      </>
                    ) : (
                      <Button
                        type="button"
                        loading={submittingId === appointmentId}
                        disabled={submittingId === appointmentId}
                        onClick={() => handleCreateReview(appointmentId)}
                      >
                        Submit review
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
        Reviews are loaded through doctor review endpoints because a dedicated
        patient review listing endpoint is not currently available.
      </div>
    </div>
  );
}

export default PatientReviews;
