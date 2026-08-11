import {
  CalendarDays,
  ClipboardList,
  Clock3,
  ExternalLink,
  FileText,
  Pill,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Button from "../../components/common/Button.jsx";
import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import Input from "../../components/common/Input.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import StatusBadge from "../../components/common/StatusBadge.jsx";
import api from "../../services/api.js";

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const emptyMedication = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

function DoctorConsultation() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [session, setSession] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const [confirming, setConfirming] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const [creatingPrescription, setCreatingPrescription] = useState(false);

  const [form, setForm] = useState({
    medications: [{ ...emptyMedication }],
    notes: "",
  });

  const loadData = async () => {
    const [appointmentResponse, sessionResponse, prescriptionsResponse] =
      await Promise.all([
        api.get(`/appointments/${appointmentId}`),
        api.get(`/consultations/appointments/${appointmentId}/session`),
        api.get("/prescriptions"),
      ]);

    const nextAppointment = appointmentResponse.data.appointment || null;
    const nextSession = sessionResponse.data.session || null;
    const doctorPrescriptions = prescriptionsResponse.data.prescriptions || [];

    setAppointment(nextAppointment);
    setSession(nextSession);
    setPrescriptions(doctorPrescriptions);
  };

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const [appointmentResponse, sessionResponse, prescriptionsResponse] =
          await Promise.all([
            api.get(`/appointments/${appointmentId}`),
            api.get(`/consultations/appointments/${appointmentId}/session`),
            api.get("/prescriptions"),
          ]);

        if (!active) {
          return;
        }

        setAppointment(appointmentResponse.data.appointment || null);
        setSession(sessionResponse.data.session || null);
        setPrescriptions(prescriptionsResponse.data.prescriptions || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 404 || requestError?.status === 400) {
          setNotFound(true);
        } else if (requestError?.status === 403) {
          setError("You do not have access to this consultation.");
        } else if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError(requestError.message || "Unable to load consultation data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, [appointmentId]);

  const appointmentPrescription = useMemo(() => {
    return (
      prescriptions.find((prescription) => {
        const linkedAppointmentId =
          prescription.appointment?._id || prescription.appointment?.id;
        return linkedAppointmentId === appointmentId;
      }) || null
    );
  }, [prescriptions, appointmentId]);

  const canConfirmAppointment = appointment?.status === "pending";
  const canStartSession =
    appointment?.status === "confirmed" &&
    session?.sessionStatus === "not_started";
  const canEndSession = session?.sessionStatus === "active";
  const canCreatePrescription =
    appointment?.status === "completed" && !appointmentPrescription;

  const updateMedication = (index, field, value) => {
    setForm((current) => {
      const next = [...current.medications];
      next[index] = {
        ...next[index],
        [field]: value,
      };

      return {
        ...current,
        medications: next,
      };
    });
  };

  const addMedication = () => {
    setForm((current) => ({
      ...current,
      medications: [...current.medications, { ...emptyMedication }],
    }));
  };

  const removeMedication = (index) => {
    setForm((current) => {
      if (current.medications.length === 1) {
        return current;
      }

      return {
        ...current,
        medications: current.medications.filter((_, idx) => idx !== index),
      };
    });
  };

  const clearActionFeedback = () => {
    setActionError("");
    setActionSuccess("");
  };

  const handleConfirmAppointment = async () => {
    clearActionFeedback();
    setConfirming(true);

    try {
      await api.patch(`/appointments/${appointmentId}`, {
        status: "confirmed",
      });

      await loadData();
      setActionSuccess(
        "Appointment confirmed. Consultation can now be started.",
      );
    } catch (requestError) {
      if (requestError?.status === 409) {
        setActionError(
          requestError.message || "Appointment cannot be confirmed.",
        );
      } else if (requestError?.status === 403) {
        setActionError("You are not authorized to update this appointment.");
      } else {
        setActionError(
          requestError.message || "Unable to confirm appointment.",
        );
      }
    } finally {
      setConfirming(false);
    }
  };

  const handleStartSession = async () => {
    clearActionFeedback();
    setStartingSession(true);

    try {
      await api.post(
        `/consultations/appointments/${appointmentId}/session/start`,
        {},
      );
      await loadData();
      setActionSuccess("Consultation session started successfully.");
    } catch (requestError) {
      if (requestError?.status === 409) {
        setActionError(requestError.message || "Session cannot be started.");
      } else if (requestError?.status === 403) {
        setActionError("You are not authorized to start this session.");
      } else {
        setActionError(
          requestError.message || "Unable to start consultation session.",
        );
      }
    } finally {
      setStartingSession(false);
    }
  };

  const handleEndSession = async () => {
    clearActionFeedback();
    setEndingSession(true);

    try {
      await api.post(
        `/consultations/appointments/${appointmentId}/session/end`,
        {},
      );
      await loadData();
      setActionSuccess("Consultation session ended and appointment completed.");
    } catch (requestError) {
      if (requestError?.status === 409) {
        setActionError(requestError.message || "Session cannot be ended.");
      } else if (requestError?.status === 403) {
        setActionError("You are not authorized to end this session.");
      } else {
        setActionError(
          requestError.message || "Unable to end consultation session.",
        );
      }
    } finally {
      setEndingSession(false);
    }
  };

  const handleCreatePrescription = async (event) => {
    event.preventDefault();
    clearActionFeedback();
    setCreatingPrescription(true);

    const normalizedMedications = form.medications.map((medication) => ({
      name: medication.name.trim(),
      dosage: medication.dosage.trim(),
      frequency: medication.frequency.trim(),
      duration: medication.duration.trim(),
      instructions: medication.instructions.trim(),
    }));

    try {
      await api.post("/prescriptions", {
        patient: appointment.patient?._id || appointment.patient?.id,
        appointment: appointment._id || appointment.id,
        medications: normalizedMedications,
        notes: form.notes.trim() || undefined,
      });

      await loadData();
      setActionSuccess("Prescription created successfully.");
    } catch (requestError) {
      if (requestError?.status === 400) {
        setActionError(
          requestError.message || "Please review prescription fields.",
        );
      } else if (requestError?.status === 409) {
        setActionError(
          requestError.message ||
            "A prescription already exists for this appointment.",
        );
      } else if (requestError?.status === 403) {
        setActionError("You are not authorized to create this prescription.");
      } else {
        setActionError(
          requestError.message || "Unable to create prescription.",
        );
      }
    } finally {
      setCreatingPrescription(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size="lg" className="text-[#2563EB]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <EmptyState
        title="Consultation not found"
        description="This appointment does not exist or cannot be accessed from your account."
        actionLabel="Back to appointments"
        onAction={() => navigate("/doctor/appointments")}
        Icon={ClipboardList}
      />
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

  if (!appointment || !session) {
    return null;
  }

  const patientName = `${appointment.patient?.firstName || "Patient"} ${
    appointment.patient?.lastName || ""
  }`.trim();

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
          Consultation workspace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A]">
          Consultation with {patientName}
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Manage session lifecycle and prescription actions using existing
          backend workflows.
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

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Appointment context
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Patient
              </p>
              <p className="mt-1 text-sm font-medium text-[#0F172A]">
                {patientName}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Date
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <CalendarDays className="h-4 w-4 text-[#2563EB]" />
                {formatDate(appointment.date)}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Time
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <Clock3 className="h-4 w-4 text-[#2563EB]" />
                {appointment.startTime} - {appointment.endTime}
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Appointment status
              </p>
              <div className="mt-1">
                <StatusBadge status={appointment.status} />
              </div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Session status
              </p>
              <div className="mt-1">
                <StatusBadge status={session.sessionStatus} />
              </div>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Consultation type
              </p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <Video className="h-4 w-4 text-[#2563EB]" />
                {appointment.consultationType || "video"}
              </p>
            </div>
          </div>

          {appointment.reason ? (
            <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Reason
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#475569]">
                {appointment.reason}
              </p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleConfirmAppointment}
              loading={confirming}
              disabled={
                !canConfirmAppointment ||
                confirming ||
                startingSession ||
                endingSession
              }
            >
              Confirm appointment
            </Button>

            <Button
              type="button"
              onClick={handleStartSession}
              loading={startingSession}
              disabled={
                !canStartSession ||
                startingSession ||
                endingSession ||
                confirming
              }
            >
              Start consultation
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleEndSession}
              loading={endingSession}
              disabled={
                !canEndSession || endingSession || startingSession || confirming
              }
            >
              End consultation
            </Button>

            {appointment.meetingUrl ? (
              <a
                href={appointment.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#CBD5E1] px-4 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-white hover:text-[#1D4ED8]"
              >
                <ExternalLink className="h-4 w-4" />
                Open meeting link
              </a>
            ) : null}
          </div>

          <div className="mt-4 rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-4 text-sm text-[#1D4ED8]">
            Existing integration exposes a meetingUrl and consultation session
            lifecycle; no additional video SDK is introduced in this phase.
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-[#0D9488]" />
            <h2 className="text-xl font-semibold text-[#0F172A]">
              Prescription
            </h2>
          </div>

          {appointmentPrescription ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] p-4 text-sm text-[#0F766E]">
                A prescription already exists for this appointment.
              </div>

              <div className="space-y-3">
                {appointmentPrescription.medications?.map(
                  (medication, index) => (
                    <div
                      key={`${medication.name}-${index}`}
                      className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                    >
                      <p className="font-semibold text-[#0F172A]">
                        {medication.name}
                      </p>
                      <p className="mt-1 text-sm text-[#64748B]">
                        {medication.dosage} · {medication.frequency} ·{" "}
                        {medication.duration}
                      </p>
                      {medication.instructions ? (
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#64748B]">
                          {medication.instructions}
                        </p>
                      ) : null}
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : canCreatePrescription ? (
            <form
              className="mt-4 space-y-4"
              onSubmit={handleCreatePrescription}
            >
              {form.medications.map((medication, index) => (
                <div
                  key={`medication-row-${index}`}
                  className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                >
                  <p className="mb-3 text-sm font-semibold text-[#0F172A]">
                    Medication {index + 1}
                  </p>

                  <div className="grid gap-3">
                    <Input
                      label="Name"
                      name={`medication-name-${index}`}
                      value={medication.name}
                      onChange={(event) =>
                        updateMedication(index, "name", event.target.value)
                      }
                      required
                    />
                    <Input
                      label="Dosage"
                      name={`medication-dosage-${index}`}
                      value={medication.dosage}
                      onChange={(event) =>
                        updateMedication(index, "dosage", event.target.value)
                      }
                      required
                    />
                    <Input
                      label="Frequency"
                      name={`medication-frequency-${index}`}
                      value={medication.frequency}
                      onChange={(event) =>
                        updateMedication(index, "frequency", event.target.value)
                      }
                      required
                    />
                    <Input
                      label="Duration"
                      name={`medication-duration-${index}`}
                      value={medication.duration}
                      onChange={(event) =>
                        updateMedication(index, "duration", event.target.value)
                      }
                      required
                    />
                    <Input
                      label="Instructions"
                      name={`medication-instructions-${index}`}
                      value={medication.instructions}
                      onChange={(event) =>
                        updateMedication(
                          index,
                          "instructions",
                          event.target.value,
                        )
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={
                        form.medications.length === 1 || creatingPrescription
                      }
                      onClick={() => removeMedication(index)}
                    >
                      Remove medication
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addMedication}
                disabled={creatingPrescription}
              >
                Add medication
              </Button>

              <div>
                <label
                  htmlFor="prescription-notes"
                  className="mb-2 block text-sm font-semibold text-[#0F172A]"
                >
                  Notes
                </label>
                <textarea
                  id="prescription-notes"
                  name="prescription-notes"
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#0F172A] shadow-sm outline-none transition-all duration-200 placeholder:text-[#94A3B8] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:ring-4 focus:ring-[#DBEAFE]"
                  placeholder="Optional prescription notes"
                />
              </div>

              <Button
                type="submit"
                loading={creatingPrescription}
                disabled={creatingPrescription}
                fullWidth
              >
                Create prescription
              </Button>
            </form>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4 text-sm text-[#64748B]">
              Prescription creation is available only after the appointment is
              completed.
            </div>
          )}
        </Card>
      </section>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">
              Doctor prescription history
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Recent prescriptions created from your consultations.
            </p>
          </div>
          <FileText className="h-5 w-5 text-[#2563EB]" />
        </div>

        <div className="mt-4 space-y-3">
          {prescriptions.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
              No prescriptions created yet.
            </p>
          ) : (
            prescriptions.slice(0, 5).map((prescription) => {
              const id = prescription._id || prescription.id;
              const linkedAppointmentId =
                prescription.appointment?._id || prescription.appointment?.id;

              return (
                <div
                  key={id}
                  className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                >
                  <p className="font-semibold text-[#0F172A]">
                    {prescription.patient?.firstName || "Patient"}{" "}
                    {prescription.patient?.lastName || ""}
                  </p>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Appointment: {formatDate(prescription.appointment?.date)} ·{" "}
                    {prescription.appointment?.startTime} -{" "}
                    {prescription.appointment?.endTime}
                  </p>
                  <p className="mt-1 text-sm text-[#64748B]">
                    Medications:{" "}
                    {Array.isArray(prescription.medications)
                      ? prescription.medications.length
                      : 0}
                  </p>

                  {linkedAppointmentId === appointmentId ? (
                    <span className="mt-2 inline-flex rounded-full border border-[#CCFBF1] bg-[#F0FDFA] px-2.5 py-1 text-xs font-semibold text-[#0F766E]">
                      Current appointment
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link
          to={`/doctor/appointments/${appointmentId}`}
          className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
        >
          Back to appointment details
        </Link>
        <Link
          to="/doctor/history"
          className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          View consultation history
        </Link>
      </div>
    </div>
  );
}

export default DoctorConsultation;
