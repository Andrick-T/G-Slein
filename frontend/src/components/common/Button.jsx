import Spinner from "./Spinner.jsx";

function Button({
  children,
  type = "button",
  disabled = false,
  loading = false,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  fullWidth = false,
  ...props
}) {
  const isDisabled = disabled || loading;

  const variants = {
    primary:
      "bg-[#2563EB] text-white shadow-sm hover:bg-[#1D4ED8] hover:shadow-md focus-visible:ring-[#DBEAFE]",

    secondary:
      "bg-[#0D9488] text-white shadow-sm hover:bg-[#0F766E] hover:shadow-md focus-visible:ring-[#CCFBF1]",

    outline:
      "border border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#2563EB] hover:bg-[#F8FAFC] hover:text-[#1D4ED8] focus-visible:ring-[#DBEAFE]",

    danger:
      "bg-[#DC2626] text-white shadow-sm hover:bg-red-700 hover:shadow-md focus-visible:ring-red-100",

    ghost:
      "bg-transparent text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] focus-visible:ring-slate-200",
  };

  const sizes = {
    sm: "min-h-9 px-3 text-xs",
    md: "min-h-10 px-4 text-sm",
    lg: "min-h-11 px-5 text-sm",
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-lg",
        "font-semibold",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
        sizes[size] || sizes.md,
        variants[variant] || variants.primary,
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      aria-busy={loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}

      <span>{children}</span>
    </button>
  );
}

export default Button;
