import {
  AlertCircle,
  CalendarDays,
  Clock3,
  FileText,
  Stethoscope,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import api from "../../services/api.js";

const APPOINTMENT_SLOT_MINUTES = 30;
const SLOT_VALUES = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addMinutes = (timeValue, minutes) => {
  if (!/^\d{2}:\d{2}$/.test(timeValue)) {
    return "";
  }

  const [hours, mins] = timeValue.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
};

const isPastSelection = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) {
    return false;
  }

  const selected = new Date(`${dateValue}T${timeValue}:00`);

  if (Number.isNaN(selected.getTime())) {
    return true;
  }

  return selected < new Date();
};

function PatientDoctorBooking() {
  const navigate = useNavigate();
  const { doctorId } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [doctorError, setDoctorError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [startTime, setStartTime] = useState("");
  const [reason, setReason] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [conflictError, setConflictError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDoctor = async () => {
      setLoadingDoctor(true);
      setDoctorError("");
      setNotFound(false);

      try {
        const response = await api.get(`/doctors/${doctorId}`);

        if (!active) {
          return;
        }

        setDoctor(response.data.doctor || null);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 404 || requestError?.status === 400) {
          setNotFound(true);
        } else {
          setDoctorError(requestError.message || "Unable to load doctor.");
        }
      } finally {
        if (active) {
          setLoadingDoctor(false);
        }
      }
    };

    loadDoctor();

    return () => {
      active = false;
    };
  }, [doctorId]);

  const endTime = useMemo(
    () => addMinutes(startTime, APPOINTMENT_SLOT_MINUTES),
    [startTime],
  );

  const minDate = useMemo(() => toDateInputValue(new Date()), []);

  const validateForm = () => {
    const errors = {};

    if (!doctor?.id) {
      errors.doctor = "Doctor information is missing.";
    }

    if (!date) {
      errors.date = "Please select an appointment date.";
    }

    if (!startTime) {
      errors.time = "Please select an appointment time.";
    }

    if (date && startTime && isPastSelection(date, startTime)) {
      errors.time = "Please choose a future appointment time.";
    }

    if (reason.trim().length > 500) {
      errors.reason = "Reason must be 500 characters or less.";
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitError("");
    setConflictError("");

    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await api.post("/appointments", {
        doctor: doctor.id,
        date,
        startTime,
        endTime,
        consultationType: "video",
        reason: reason.trim() || undefined,
      });

      const appointment = response?.data?.appointment;
      const paymentRequired =
        Boolean(response?.data?.paymentRequired) ||
        appointment?.paymentStatus !== "paid";

      if (!appointment?.id) {
        throw new Error(
          "Appointment created but confirmation data is missing.",
        );
      }

      navigate(
        `/patient/appointments/confirmation/${appointment.id}?payment=${
          paymentRequired ? "required" : "confirmed"
        }`,
        {
          replace: true,
        },
      );
    } catch (requestError) {
      if (requestError?.status === 409) {
        setConflictError(
          requestError.message ||
            "That slot is no longer available. Please select another time.",
        );
      } else if (requestError?.status === 400) {
        setSubmitError(
          requestError.message || "Please review your booking details.",
        );
      } else if (requestError?.status === 401) {
        setSubmitError(
          "Your session has expired. Please sign in and try again.",
        );
      } else {
        setSubmitError(requestError.message || "Unable to create appointment.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDoctor) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" className="text-[#2563EB]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <EmptyState
        title="Doctor not found"
        description="This booking link is invalid or the doctor is no longer available."
        actionLabel="Back to doctors"
        onAction={() => navigate("/patient/doctors")}
        Icon={Stethoscope}
      />
    );
  }

  if (doctorError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]"
      >
        {doctorError}
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
          Appointment booking
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A]">
          Book an appointment with Dr. {doctor.firstName} {doctor.lastName}
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Choose your date and time. Final availability is confirmed at booking.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Booking details
          </h2>

          {fieldErrors.doctor ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]"
            >
              {fieldErrors.doctor}
            </div>
          ) : null}

          {submitError ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]"
            >
              {submitError}
            </div>
          ) : null}

          {conflictError ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-[#FEE2E2] bg-[#FFF1F2] px-4 py-3 text-sm text-[#BE123C]"
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0"
                  aria-hidden="true"
                />
                <p>{conflictError}</p>
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            <div>
              <label
                htmlFor="appointment-date"
                className="mb-2 block text-sm font-semibold text-[#0F172A]"
              >
                Appointment date
              </label>
              <input
                id="appointment-date"
                name="appointment-date"
                type="date"
                min={minDate}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    date: undefined,
                  }));
                  setConflictError("");
                }}
                className="min-h-11 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm outline-none transition-all duration-200 hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-4 focus:ring-[#DBEAFE]"
                required
                aria-invalid={Boolean(fieldErrors.date)}
                aria-describedby={
                  fieldErrors.date ? "appointment-date-error" : undefined
                }
              />
              {fieldErrors.date ? (
                <p
                  id="appointment-date-error"
                  className="mt-1.5 text-sm font-medium text-[#DC2626]"
                >
                  {fieldErrors.date}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="appointment-time"
                className="mb-2 block text-sm font-semibold text-[#0F172A]"
              >
                Appointment time
              </label>
              <select
                id="appointment-time"
                name="appointment-time"
                value={startTime}
                onChange={(event) => {
                  setStartTime(event.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    time: undefined,
                  }));
                  setConflictError("");
                }}
                className="min-h-11 w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm outline-none transition-all duration-200 hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-4 focus:ring-[#DBEAFE]"
                required
                aria-invalid={Boolean(fieldErrors.time)}
                aria-describedby={
                  fieldErrors.time ? "appointment-time-error" : undefined
                }
              >
                <option value="">Select a time slot</option>
                {SLOT_VALUES.map((timeValue) => (
                  <option key={timeValue} value={timeValue}>
                    {timeValue}
                  </option>
                ))}
              </select>
              {fieldErrors.time ? (
                <p
                  id="appointment-time-error"
                  className="mt-1.5 text-sm font-medium text-[#DC2626]"
                >
                  {fieldErrors.time}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="appointment-reason"
                className="mb-2 block text-sm font-semibold text-[#0F172A]"
              >
                Reason for consultation (optional)
              </label>
              <textarea
                id="appointment-reason"
                name="appointment-reason"
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setFieldErrors((current) => ({
                    ...current,
                    reason: undefined,
                  }));
                }}
                rows={4}
                maxLength={500}
                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm outline-none transition-all duration-200 hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-4 focus:ring-[#DBEAFE]"
                placeholder="Briefly describe the reason for your appointment"
                aria-invalid={Boolean(fieldErrors.reason)}
                aria-describedby={
                  fieldErrors.reason ? "appointment-reason-error" : undefined
                }
              />
              {fieldErrors.reason ? (
                <p
                  id="appointment-reason-error"
                  className="mt-1.5 text-sm font-medium text-[#DC2626]"
                >
                  {fieldErrors.reason}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                to={`/patient/doctors/${doctor.id}`}
                className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
              >
                Back to profile
              </Link>
              <Button type="submit" loading={submitting} disabled={submitting}>
                Confirm booking
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Selected doctor
          </h2>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <Stethoscope className="h-4 w-4 text-[#0D9488]" />
                Doctor
              </div>
              <p className="mt-1 text-sm text-[#475569]">
                Dr. {doctor.firstName} {doctor.lastName}
              </p>
              <p className="mt-1 text-sm text-[#475569]">
                {doctor?.doctorProfile?.specialization || "General Medicine"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <CalendarDays className="h-4 w-4 text-[#2563EB]" />
                Date
              </div>
              <p className="mt-1 text-sm text-[#475569]">
                {date || "Not selected"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <Clock3 className="h-4 w-4 text-[#2563EB]" />
                Time
              </div>
              <p className="mt-1 text-sm text-[#475569]">
                {startTime ? `${startTime} - ${endTime}` : "Not selected"}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <FileText className="h-4 w-4 text-[#2563EB]" />
                Consultation type
              </div>
              <p className="mt-1 text-sm text-[#475569]">Video consultation</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default PatientDoctorBooking;
