import { ArrowRight, Info } from "lucide-react";

import Button from "./Button.jsx";

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  Icon = Info,
  className = "",
}) {
  return (
    <div
      className={[
        "rounded-2xl",
        "border border-dashed border-[#CBD5E1]",
        "bg-gradient-to-b from-[#F8FAFC] to-white",
        "px-5 py-8 text-center",
        "sm:px-8 sm:py-10",
        className,
      ].join(" ")}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DBEAFE] text-[#2563EB] shadow-sm">
        <Icon aria-hidden="true" className="h-7 w-7" />
      </div>

      <h2 className="mt-5 text-lg font-bold tracking-tight text-[#0F172A]">
        {title}
      </h2>

      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
          {description}
        </p>
      ) : null}

      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button type="button" onClick={onAction}>
            {actionLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default EmptyState;
