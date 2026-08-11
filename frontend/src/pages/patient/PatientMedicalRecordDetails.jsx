import { ExternalLink, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Card from "../../components/common/Card.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
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

function PatientMedicalRecordDetails() {
  const navigate = useNavigate();
  const { recordId } = useParams();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    const loadRecord = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const response = await api.get(`/medical-records/${recordId}`);

        if (!active) {
          return;
        }

        setRecord(response.data.medicalRecord || null);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 404 || requestError?.status === 400) {
          setNotFound(true);
        } else if (requestError?.status === 403) {
          setError("You are not allowed to access this medical record.");
        } else if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else {
          setError(requestError.message || "Unable to load medical record.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRecord();

    return () => {
      active = false;
    };
  }, [recordId]);

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
        title="Medical record not found"
        description="This record does not exist or cannot be accessed from your account."
        actionLabel="Back to medical records"
        onAction={() => navigate("/patient/medical-records")}
        Icon={FileText}
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

  if (!record) {
    return null;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
          Medical record details
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A]">
          {record.title || "Medical record"}
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Document metadata and access information.
        </p>
      </header>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Created on
            </p>
            <p className="mt-1 text-sm font-medium text-[#0F172A]">
              {formatDate(record.createdAt)}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              File type
            </p>
            <p className="mt-1 text-sm font-medium text-[#0F172A]">
              {record.fileType || "Not available"}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              File name
            </p>
            <p className="mt-1 break-all text-sm font-medium text-[#0F172A]">
              {record.fileName || "Not available"}
            </p>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
              Description
            </p>
            <p className="mt-1 text-sm text-[#475569]">
              {record.description || "No description provided."}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/patient/medical-records"
            className="inline-flex items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
          >
            Back to records
          </Link>

          {record.fileUrl ? (
            <a
              href={record.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              <ExternalLink className="h-4 w-4" />
              View file
            </a>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

export default PatientMedicalRecordDetails;
