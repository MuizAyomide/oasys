
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, user, isAdmin, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center bg-indigo-50"
      >
        Checking your session...
      </div>
    );
  }

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      await login(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Login failed:", err.code || err.message);

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (err.message?.includes("not authorized")) {
        setError("This account does not have administrator access.");
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl shadow-indigo-200/60 sm:p-10"
      >
        <div className="mb-7 flex justify-center">
          <div className="rounded-3xl bg-indigo-600 p-5 text-white shadow-lg shadow-indigo-200">
            <ShieldCheck size={42} />
          </div>
        </div>

        <h1 className="text-center text-3xl font-black text-indigo-950">
          OASYS Admin
        </h1>

        <p className="mt-3 text-center leading-relaxed text-slate-500">
          Sign in to manage vocabulary and daily challenges.
        </p>

        <form onSubmit={handleSubmit} className="mt-9 space-y-5">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block font-bold text-slate-700"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                placeholder="Enter admin email"
                required
                className="w-full rounded-2xl border-2 border-indigo-100 bg-indigo-50 py-4 pl-12 pr-4 text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block font-bold text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <LockKeyhole
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Enter password"
                required
                className="w-full rounded-2xl border-2 border-indigo-100 bg-indigo-50 py-4 pl-12 pr-14 text-slate-900 outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={21} /> : <Eye size={21} />}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-indigo-600 px-7 py-4 font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing In..." : "Sign In to Dashboard"}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-bold text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={18} />
            Back to OASYS
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
