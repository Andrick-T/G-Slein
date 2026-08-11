function formatStatusLabel(status) {
  if (!status) {
    return "Unknown";
  }

  return status
    .toString()
    .trim()
    .replace(/[\_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function StatusBadge({ status, className = "" }) {
  const normalized = status?.toString().trim().toLowerCase();

  const toneClass =
    normalized === "pending"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : normalized === "confirmed"
        ? "border-blue-200 bg-blue-50 text-blue-800"
        : normalized === "completed" ||
            normalized === "paid" ||
            normalized === "active"
          ? "border-green-200 bg-green-50 text-green-800"
          : normalized === "cancelled" ||
              normalized === "rejected" ||
              normalized === "failed" ||
              normalized === "inactive"
            ? "border-red-200 bg-red-50 text-red-800"
            : normalized === "in progress"
              ? "border-teal-200 bg-teal-50 text-teal-800"
              : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5",
        "rounded-full",
        "border",
        "px-2.5 py-1",
        "text-xs font-semibold",
        "leading-none",
        toneClass,
        className,
      ].join(" ")}
      aria-label={`Status: ${formatStatusLabel(status)}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
        aria-hidden="true"
      />

      {formatStatusLabel(status)}
    </span>
  );
}

export default StatusBadge;
