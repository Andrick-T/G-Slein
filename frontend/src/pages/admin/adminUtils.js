export const getEntityId = (value) => {
  if (!value) {
    return "";
  }

  return value._id || value.id || "";
};

export const formatDate = (value) => {
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

export const formatDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const normalizeText = (value) => {
  return (value || "").toString().trim().toLowerCase();
};

export const formatAmount = (amount, currency = "USD") => {
  if (!Number.isFinite(amount)) {
    return "Not available";
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: (currency || "USD").toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency || "USD"}`;
  }
};
