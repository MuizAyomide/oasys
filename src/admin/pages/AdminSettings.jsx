
import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase/config";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";

export default function AdminSettings() {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function reauthenticate() {
    const currentUser = auth.currentUser;

    if (!currentUser?.email) {
      throw new Error("Administrator session unavailable.");
    }

    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );

    await reauthenticateWithCredential(currentUser, credential);

    return currentUser;
  }

  async function changePassword(event) {
    event.preventDefault();

    if (newPassword.length < 12) {
      setError("Use a password with at least 12 characters.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const currentUser = await reauthenticate();
      await updatePassword(currentUser, newPassword);

      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message || "Unable to update password.");
    } finally {
      setBusy(false);
    }
  }

  async function changeEmail(event) {
    event.preventDefault();

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const currentUser = await reauthenticate();

      await verifyBeforeUpdateEmail(
        currentUser,
        newEmail.trim()
      );

      setMessage(
        "Verification sent. Check the new email address " +
        "and follow the instructions to complete the change."
      );

      setCurrentPassword("");
      setNewEmail("");
    } catch (err) {
      setError(err.message || "Unable to request email change.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <div>
        <h2 className="text-3xl font-black text-indigo-950">
          Admin Settings
        </h2>

        <p className="mt-2 text-slate-600">
          Manage your OASYS administrator account.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-indigo-600" size={28} />

          <div>
            <p className="font-black text-indigo-950">
              Administrator Account
            </p>
            <p className="break-all text-sm text-slate-500">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {message && (
        <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-700">
          {error}
        </p>
      )}

      <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <h3 className="mb-5 flex items-center gap-3 text-xl font-black text-indigo-950">
          <LockKeyhole size={23} />
          Change Password
        </h3>

        <form onSubmit={changePassword} className="space-y-4">
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            aria-label="Current password"
            className="w-full rounded-xl border-2 border-slate-100 p-4 outline-none focus:border-indigo-500"
          />

          <input
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (12+ characters)"
            aria-label="New password"
            className="w-full rounded-xl border-2 border-slate-100 p-4 outline-none focus:border-indigo-500"
          />

          <button
            disabled={busy}
            className="rounded-full bg-indigo-600 px-7 py-3 font-bold text-white disabled:opacity-40"
          >
            Update Password
          </button>
        </form>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <h3 className="mb-5 flex items-center gap-3 text-xl font-black text-indigo-950">
          <Mail size={23} />
          Change Email
        </h3>

        <form onSubmit={changeEmail} className="space-y-4">
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New email address"
            aria-label="New email address"
            className="w-full rounded-xl border-2 border-slate-100 p-4 outline-none focus:border-indigo-500"
          />

          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            aria-label="Current password for email change"
            className="w-full rounded-xl border-2 border-slate-100 p-4 outline-none focus:border-indigo-500"
          />

          <button
            disabled={busy}
            className="rounded-full bg-indigo-600 px-7 py-3 font-bold text-white disabled:opacity-40"
          >
            Request Email Change
          </button>
        </form>
      </div>

      <p className="text-sm text-slate-500">
        The Log Out button is available in the admin navigation bar.
      </p>
    </div>
  );
}
