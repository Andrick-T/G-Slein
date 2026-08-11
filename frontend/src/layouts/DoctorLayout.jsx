import { Link, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

function DoctorLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="flex items-center justify-between px-4 py-4">
          <Link to="/doctor" className="text-xl font-bold text-slate-900">
            G-Slein
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:block">
              {user?.firstName}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)]">
        <aside className="hidden w-64 border-r bg-white p-4 md:block">
          <nav>
            <Link
              to="/doctor"
              className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Dashboard
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DoctorLayout;
