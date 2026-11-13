
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute() {
  const { user, isAdmin, loading, authError } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-50">
        <div className="text-center">
          <ShieldCheck
            size={48}
            className="mx-auto mb-5 animate-pulse text-indigo-600"
          />

          <p className="font-bold text-indigo-900">
            Verifying administrator access...
          </p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-indigo-50 px-5 text-center">
        <h1 className="text-2xl font-black text-indigo-950">
          Unable to Verify Access
        </h1>

        <p className="mt-4 text-slate-600">
          {authError}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-full bg-indigo-600 px-6 py-3 font-bold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <Outlet />;
}
