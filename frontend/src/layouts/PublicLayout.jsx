import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navigationLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Why G-Slein", href: "/#why-g-slein" },
  { label: "Log in", to: "/login" },
];

function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5"
            aria-label="G-Slein home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB] text-sm font-bold text-white shadow-sm">
              G
            </span>

            <span className="text-lg font-bold tracking-tight text-[#0F172A]">
              G-Slein
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-7 md:flex">
            {navigationLinks.map((link) =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm font-medium text-[#64748B] transition-colors hover:text-[#0F172A]"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-[#64748B] transition-colors hover:text-[#0F172A]"
                >
                  {link.label}
                </a>
              ),
            )}

            <Link
              to="/register"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD] focus-visible:ring-offset-2"
            >
              Get started
            </Link>
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/register"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#2563EB] px-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8]"
            >
              Get started
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              aria-expanded={mobileMenuOpen}
              aria-controls="public-mobile-menu"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#334155] transition-colors hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD]"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div
          id="public-mobile-menu"
          className={`border-t border-[#E2E8F0] bg-white md:hidden ${
            mobileMenuOpen ? "block" : "hidden"
          }`}
        >
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {navigationLinks.map((link) =>
              link.to ? (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                >
                  {link.label}
                </a>
              ),
            )}

            {!isHomePage && (
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#334155] transition-colors hover:bg-[#F8FAFC]"
              >
                Home
              </Link>
            )}

            <div className="mt-2 border-t border-[#E2E8F0] pt-3">
              <Link
                to="/register"
                onClick={closeMobileMenu}
                className="flex h-10 items-center justify-center rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
              >
                Create an account
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;
