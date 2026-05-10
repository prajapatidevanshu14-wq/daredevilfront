import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { getBrowserFingerprint } from "./lib/fingerprint.ts";
import { supabase } from "./lib/supabase.ts";
import { useState, useEffect } from "react";

const STORAGE_KEY = "gotham-access-key";
const STORAGE_FP = "gotham-fingerprint";

function Root() {
  const [authState, setAuthState] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedKey = localStorage.getItem(STORAGE_KEY);
      const savedFp = localStorage.getItem(STORAGE_FP);

      if (!savedKey || !savedFp) {
        setAuthState("unauthenticated");
        return;
      }

      // Verify fingerprint matches current browser
      const currentFp = await getBrowserFingerprint();

      if (currentFp !== savedFp) {
        // Different browser — clear and block
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_FP);
        setAuthState("unauthenticated");
        return;
      }

      // Verify key still active in Supabase
      const { data, error } = await supabase
        .from("access_keys")
        .select("is_active, fingerprint")
        .eq("key", savedKey)
        .single();

      if (error || !data) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_FP);
        setAuthState("unauthenticated");
        return;
      }

      if (!data.is_active) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_FP);
        setAuthState("unauthenticated");
        return;
      }

      if (data.fingerprint !== currentFp) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_FP);
        setAuthState("unauthenticated");
        return;
      }

      // All checks passed
      setAuthState("authenticated");

    } catch (err) {
      console.error("Auth check failed:", err);
      setAuthState("unauthenticated");
    }
  };

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl">🦇</span>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
            <span className="text-sm text-yellow-600">Initializing Gotham...</span>
          </div>
        </div>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <LoginPage onAuthenticated={() => setAuthState("authenticated")} />
    );
  }

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
