import { Link, Outlet } from "react-router-dom";

function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-bold text-slate-900">
            G-Slein
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Register
            </Link>
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
