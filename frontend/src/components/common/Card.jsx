function Card({
  children,
  className = "",
  padding = "default",
  hover = false,
  ...props
}) {
  const paddingClasses = {
    none: "",
    compact: "p-4",
    default: "p-5 sm:p-6",
    spacious: "p-6 sm:p-8",
  };

  return (
    <section
      className={[
        "rounded-xl",
        "border border-[#E2E8F0]",
        "bg-white",
        "shadow-[0_1px_3px_rgba(15,23,42,0.05)]",
        "transition-all duration-200",
        paddingClasses[padding] || paddingClasses.default,
        hover
          ? "hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
          : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </section>
  );
}

export default Card;
