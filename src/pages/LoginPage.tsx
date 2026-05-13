import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { getBrowserFingerprint } from "../lib/fingerprint";

const STORAGE_KEY = "gotham-access-key";
const STORAGE_FP = "gotham-fingerprint";

interface LoginPageProps {
  onAuthenticated: () => void;
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const [keyInput, setKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 🔥 Auto-login: if key already saved in localStorage, go straight in
  useState(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    if (savedKey && savedKey.trim().length > 0) {
      onAuthenticated();
    }
  });

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
      // Step 1: Get browser fingerprint
      const fingerprint = await getBrowserFingerprint();

      // Step 2: Look up the key in Supabase
      const { data, error: fetchError } = await supabase
        .from("access_keys")
        .select("*")
        .eq("key", trimmedKey)
        .single();

      if (fetchError || !data) {
        setError("Invalid access key. Contact your administrator.");
        setLoading(false);
        return;
      }

      // Step 3: Check if key is active
      if (!data.is_active) {
        setError("This key has been revoked. Contact your administrator.");
        setLoading(false);
        return;
      }

      // Step 4: Check fingerprint
      if (data.fingerprint === null) {
        // Key never used before — activate it for this browser
        const { error: updateError } = await supabase
          .from("access_keys")
          .update({
            fingerprint: fingerprint,
            activated_at: new Date().toISOString(),
          })
          .eq("key", trimmedKey);

        if (updateError) {
          setError("Activation failed. Try again.");
          setLoading(false);
          return;
        }

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, trimmedKey);
        localStorage.setItem(STORAGE_FP, fingerprint);

        setSuccess(true);
        setTimeout(() => {
          onAuthenticated();
        }, 1500);

      } else if (data.fingerprint === fingerprint) {
        // Same browser — already activated, allow in
        localStorage.setItem(STORAGE_KEY, trimmedKey);
        localStorage.setItem(STORAGE_FP, fingerprint);

        setSuccess(true);
        setTimeout(() => {
          onAuthenticated();
        }, 1500);

      } else {
        // Different browser fingerprint — block
        setError(
          "This key is already activated on a different browser. Each key can only be used in one browser."
        );
        setLoading(false);
        return;
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
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

        {/* Card */}
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

        {/* Bottom quote */}
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
