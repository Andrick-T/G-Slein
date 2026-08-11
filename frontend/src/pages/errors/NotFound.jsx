import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>

        <p className="mt-4 text-slate-600">
          The page you are looking for does not exist.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
