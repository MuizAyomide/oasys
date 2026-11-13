
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  Menu,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const pageTitles = {
  "/admin": "Dashboard",
  "/admin/words": "Manage Words",
  "/admin/schedule": "Daily Schedule",
  "/admin/quizzes": "Manage Quiz",
  "/admin/settings": "Settings",
};

export default function AdminNavbar({ onOpenMenu }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (signingOut) return;

    setSigningOut(true);
    setError("");

    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Unable to log out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  const title = pageTitles[location.pathname] || "Admin Panel";

  return (
    <header className="border-b border-slate-100 bg-white px-5 py-5 lg:px-9">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open admin menu"
            aria-controls="admin-sidebar"
            className="rounded-xl bg-indigo-50 p-3 text-indigo-700 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">
              OASYS Administration
            </p>

            <h1 className="text-xl font-black text-indigo-950 sm:text-2xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-2xl bg-indigo-50 px-4 py-3 md:flex">
            <ShieldCheck size={20} className="text-indigo-600" />

            <span className="max-w-48 truncate text-sm font-bold text-indigo-900">
              {user?.email || "Administrator"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={signingOut}
            className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
          >
            <LogOut size={19} />
            <span className="hidden sm:inline">
              {signingOut ? "Logging out..." : "Log Out"}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-700">
          {error}
        </p>
      )}
    </header>
  );
}
