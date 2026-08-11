import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0D9488]">
          Not found
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#0F172A] sm:text-5xl">
          This page is not available.
        </h1>

        <p className="mt-4 text-sm leading-6 text-[#64748B] sm:text-base">
          The route you requested does not exist or is no longer available.
        </p>

        <Link
          to="/"
          className="mt-7 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD] focus-visible:ring-offset-2"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
