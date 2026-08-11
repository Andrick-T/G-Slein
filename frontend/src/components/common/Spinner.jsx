function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-7 w-7",
  };

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={[
        "inline-block",
        "animate-spin",
        "rounded-full",
        "border-2",
        "border-current",
        "border-r-transparent",
        sizes[size] || sizes.md,
        className,
      ].join(" ")}
    />
  );
}

export default Spinner;
