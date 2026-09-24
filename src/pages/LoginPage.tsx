import { useState } from "react";
import { motion } from "framer-motion";
import { getBrowserFingerprint } from "../lib/fingerprint";
import {
  applyCloudData,
  getLocalDataForMigration,
  loginWithAccessKey,
  saveCloudPatchNow,
  setCloudSession,
} from "../lib/cloud";

interface LoginPageProps {
  onAuthenticated: () => void;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "expired";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [keyInput, setKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [remainingMsg, setRemainingMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = keyInput.trim().toUpperCase();

    if (!trimmedKey) {
      setError("Enter your access key.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fingerprint = await getBrowserFingerprint();
      const result = await loginWithAccessKey(trimmedKey, fingerprint);

      if (!result.success || !result.session_token) {
        const messages: Record<string, string> = {
          INVALID_KEY: "Invalid access key. Check the key and try again.",
          REVOKED: "This key has been revoked. Contact your administrator.",
          EXPIRED: "This key has expired. Contact your administrator.",
          WRONG_DEVICE: "This key is locked to another device. Ask the administrator to reset its device.",
        };
        setError(messages[result.error || ""] || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      setCloudSession(result.session_token);
      if (result.has_cloud_data) {
        applyCloudData(result.cloud_data);
      } else {
        // One-time migration: preserve this customer's existing browser data.
        await saveCloudPatchNow(getLocalDataForMigration());
      }

      setRemainingMsg("Your data is connected to cloud storage");
      setSuccess(true);
      setTimeout(() => onAuthenticated(), 700);
    } catch (err) {
      console.error("Login error:", err);
      setError("Cannot connect to cloud storage. Check your internet and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center justify-center"
          >
            <div className="relative">
              <div
                className="absolute inset-0 animate-ping rounded-full bg-yellow-500/20"
                style={{ animationDuration: "3s" }}
              />
              <span className="relative text-6xl">🦇</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-yellow-400">
              GOTHAM
            </h1>
            <p className="mt-1 text-sm text-yellow-600">SMM Command Center</p>
            <p className="mt-3 text-xs text-gray-600">
              Restricted access. Authorized personnel only.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-gray-900 to-black p-8 shadow-2xl shadow-yellow-500/5"
        >
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <span className="text-5xl">✅</span>
              <p className="mt-4 text-lg font-semibold text-emerald-400">
                Access Granted
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Welcome to Gotham Command...
              </p>
              {remainingMsg && (
                <p className="mt-2 text-xs text-yellow-500">{remainingMsg}</p>
              )}
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  Access Key
                </label>
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => {
                    setKeyInput(e.target.value.toUpperCase());
                    setError("");
                  }}
                  placeholder="GOTHAM-KEY-XXX"
                  disabled={loading}
                  autoFocus
                  className="w-full rounded-xl border border-yellow-500/30 bg-black px-4 py-3 text-sm text-white placeholder-gray-700 focus:border-yellow-500/60 focus:outline-none focus:ring-1 focus:ring-yellow-500/30 transition disabled:opacity-50 font-mono tracking-widest"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
                >
                  <p className="text-xs text-red-400">❌ {error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || !keyInput.trim()}
                className="w-full rounded-xl border border-yellow-500/50 bg-yellow-500/20 px-4 py-3 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
                    Verifying...
                  </span>
                ) : (
                  "🦇 Enter Gotham"
                )}
              </button>

              <p className="text-center text-[10px] text-gray-700">
                Keys are device-locked. One key per browser only.
              </p>
            </form>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-[10px] italic text-yellow-600/40"
        >
          "I am vengeance. I am the night. I am Batman."
        </motion.p>
      </motion.div>
    </div>
  );
}
