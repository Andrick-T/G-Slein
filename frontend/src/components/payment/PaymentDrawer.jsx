import { CalendarDays, CreditCard, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import Button from "../common/Button.jsx";
import StatusBadge from "../common/StatusBadge.jsx";

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

const formatAmount = (amount, currency = "XAF") => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "Not available";
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numericAmount);
};

function PaymentDrawer({
  open,
  appointment,
  loading = false,
  error = "",
  onClose,
  onConfirm,
}) {
  const panelRef = useRef(null);
  const confirmButtonRef = useRef(null);

  const appointmentId = appointment?._id || appointment?.id;

  const doctorName = useMemo(() => {
    if (!appointment?.doctor) {
      return "Doctor";
    }

    const firstName = appointment.doctor.firstName || "";
    const lastName = appointment.doctor.lastName || "";

    return `${firstName} ${lastName}`.trim() || "Doctor";
  }, [appointment]);

  const consultationFee = Number(
    appointment?.doctor?.doctorProfile?.consultationFee || 0,
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusConfirm = window.setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusableElements = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      const focusable = Array.from(focusableElements).filter((element) => {
        return (
          !element.hasAttribute("disabled") &&
          !element.getAttribute("aria-hidden")
        );
      });

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusConfirm);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const canPay = appointmentId && consultationFee > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/45 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-drawer-title"
      onClick={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose?.();
        }
      }}
    >
      <aside
        ref={panelRef}
        className="flex h-full w-full max-w-[34rem] transform flex-col border-l border-[#E2E8F0] bg-white shadow-2xl transition-transform duration-300 ease-out"
      >
        <header className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
              Complete payment
            </p>
            <h2
              id="payment-drawer-title"
              className="mt-1 text-xl font-semibold text-[#0F172A]"
            >
              Secure consultation payment
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Review your appointment details before continuing to Stripe.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onClose?.()}
            disabled={loading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#475569] transition hover:border-[#CBD5E1] hover:bg-[#F8FAFC] hover:text-[#0F172A] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close payment panel"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-sm font-semibold text-[#0F172A]">
              Dr. {doctorName}
            </p>
            <p className="mt-1 text-sm text-[#64748B]">Video consultation</p>
          </div>

          <dl className="space-y-3 rounded-xl border border-[#E2E8F0] bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <dt className="text-sm text-[#64748B]">Date</dt>
              <dd className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <CalendarDays className="h-4 w-4 text-[#2563EB]" />
                {formatDate(appointment?.date)}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-sm text-[#64748B]">Time</dt>
              <dd className="text-sm font-semibold text-[#0F172A]">
                {appointment?.startTime || "--:--"} -{" "}
                {appointment?.endTime || "--:--"}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-sm text-[#64748B]">Consultation fee</dt>
              <dd className="text-sm font-semibold text-[#0F172A]">
                {formatAmount(consultationFee, "XAF")}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-sm text-[#64748B]">Payment status</dt>
              <dd>
                <StatusBadge status={appointment?.paymentStatus || "pending"} />
              </dd>
            </div>
          </dl>

          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748B]">
              Payment method
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
              <CreditCard className="h-4 w-4 text-[#2563EB]" />
              Stripe
            </p>
            <p className="mt-2 text-xs text-[#64748B]">noKash coming soon.</p>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]"
            >
              {error}
            </div>
          ) : null}
        </div>

        <footer className="space-y-3 border-t border-[#E2E8F0] px-5 py-4 sm:px-6">
          <Button
            ref={confirmButtonRef}
            type="button"
            loading={loading}
            disabled={!canPay || loading}
            onClick={() => onConfirm?.(appointment)}
            fullWidth
          >
            {loading ? "Opening secure payment..." : "Continue to Stripe"}
          </Button>

          <p className="inline-flex items-center justify-center gap-2 text-center text-xs text-[#64748B]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#0D9488]" />
            Secure payment powered by Stripe
          </p>
        </footer>
      </aside>
    </div>
  );
}

export default PaymentDrawer;
