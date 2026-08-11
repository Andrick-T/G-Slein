import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Access denied</h1>

        <p className="mt-3 text-slate-600">
          You do not have permission to access this page.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;
