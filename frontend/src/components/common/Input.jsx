function Input({
  id,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error,
  hint,
  className = "",
  inputClassName = "",
  ...props
}) {
  const inputId = id || name;
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold text-[#0F172A]"
        >
          {label}

          {required ? (
            <span className="ml-1 text-[#DC2626]" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={[
          "w-full",
          "min-h-11",
          "rounded-lg",
          "border",
          "bg-white",
          "px-3.5 py-2.5",
          "text-sm text-[#0F172A]",
          "shadow-sm",
          "outline-none",
          "transition-all duration-200",
          "placeholder:text-[#94A3B8]",
          "hover:border-[#CBD5E1]",
          "focus:border-[#2563EB]",
          "focus:ring-4 focus:ring-[#DBEAFE]",
          "disabled:cursor-not-allowed",
          "disabled:bg-[#F1F5F9]",
          "disabled:text-[#94A3B8]",
          error
            ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-red-100"
            : "border-[#E2E8F0]",
          inputClassName,
        ].join(" ")}
        {...props}
      />

      {hint && !error ? (
        <p id={hintId} className="mt-1.5 text-xs text-[#64748B]">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-sm font-medium text-[#DC2626]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default Input;
