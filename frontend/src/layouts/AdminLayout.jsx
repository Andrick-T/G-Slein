import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "../context/AuthContext.jsx";

function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true, state: null });
  };

  const closeMobileNav = () => {
    setMobileNavOpen(false);
  };

  const navItems = [
    {
      to: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "/admin/users",
      label: "Users",
      icon: Users,
    },
    {
      to: "/admin/doctors",
      label: "Doctors",
      icon: Stethoscope,
    },
    {
      to: "/admin/appointments",
      label: "Appointments",
      icon: CalendarDays,
    },
    {
      to: "/admin/payments",
      label: "Payments",
      icon: CreditCard,
    },
    {
      to: "/admin/reviews",
      label: "Reviews",
      icon: Star,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link
            to="/admin"
            className="flex items-center gap-2.5"
            aria-label="G-Slein admin dashboard"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F766E] text-sm font-bold text-white shadow-sm">
              G
            </span>

            <span className="text-lg font-bold tracking-tight">G-Slein</span>
          </Link>

          <div className="hidden items-center gap-4 md:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#CCFBF1] text-sm font-semibold text-[#0F766E]">
                {user?.firstName?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-[#0F172A]">
                  {user?.firstName || "Admin"}
                </p>
                <p className="text-xs text-[#64748B]">Admin account</p>
              </div>
            </div>

            <div className="h-6 w-px bg-[#E2E8F0]" />

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileNavOpen((current) => !current)}
            aria-expanded={mobileNavOpen}
            aria-controls="admin-mobile-nav"
            aria-label={
              mobileNavOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#334155] md:hidden"
          >
            {mobileNavOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {mobileNavOpen && (
          <div
            id="admin-mobile-nav"
            className="border-t border-[#E2E8F0] bg-white px-4 py-3 md:hidden"
          >
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={closeMobileNav}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#ECFEFF] text-[#0F766E]"
                          : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-3 border-t border-[#E2E8F0] pt-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden w-60 shrink-0 border-r border-[#E2E8F0] bg-white md:block">
          <div className="sticky top-16 p-4">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#94A3B8]">
              Admin space
            </p>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#ECFEFF] text-[#0F766E]"
                          : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-8 rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#0F766E]" />
                <p className="text-xs font-semibold text-[#0F766E]">
                  Operations mode
                </p>
              </div>
              <p className="mt-1 text-xs leading-5 text-[#475569]">
                Monitor key platform activity across users, appointments,
                payments, and reviews.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
