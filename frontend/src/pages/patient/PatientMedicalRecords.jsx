import { ExternalLink, FileText, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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

function PatientMedicalRecords() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadMedicalRecords = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/medical-records");

        if (!active) {
          return;
        }

        setRecords(response.data.medicalRecords || []);
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError?.status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (requestError?.status === 403) {
          setError("You are not authorized to access medical records.");
        } else {
          setError(requestError.message || "Unable to load medical records.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMedicalRecords();

    return () => {
      active = false;
    };
  }, []);

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
          Medical records
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
          Your medical documents
        </h1>
        <p className="mt-2 text-sm text-[#64748B] sm:text-base">
          Access records shared during your care journey.
        </p>
      </header>

      {records.length === 0 ? (
        <EmptyState
          title="No medical records are available yet"
          description="Your records will appear here after healthcare documents are uploaded."
          actionLabel="Back to appointments"
          onAction={() => navigate("/patient/appointments")}
          Icon={FolderOpen}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {records.map((record) => (
            <Card
              key={record._id || record.id}
              className="flex h-full flex-col"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#1D4ED8]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#0F172A]">
                    {record.title || "Medical record"}
                  </h2>
                  <p className="mt-1 text-xs text-[#64748B]">
                    {formatDate(record.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[#64748B]">
                <p>
                  <span className="font-semibold text-[#334155]">File:</span>{" "}
                  {record.fileName || "Not available"}
                </p>
                <p>
                  <span className="font-semibold text-[#334155]">Type:</span>{" "}
                  {record.fileType || "Not available"}
                </p>
                <p className="line-clamp-3">
                  {record.description || "No description provided."}
                </p>
              </div>

              <div className="mt-5 grid gap-2">
                <Link
                  to={`/patient/medical-records/${record._id || record.id}`}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8]"
                >
                  View details
                </Link>

                {record.fileUrl ? (
                  <a
                    href={record.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View file
                  </a>
                ) : null}
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}

export default PatientMedicalRecords;
