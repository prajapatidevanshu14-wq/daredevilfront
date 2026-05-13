import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
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

      // 🔥 Simple check: if key exists in localStorage, user is authenticated
      // Key was already validated against Supabase when first entered
      // No need to re-verify every time — localStorage is the source of truth
      if (savedKey && savedKey.trim().length > 0) {
        setAuthState("authenticated");
        return;
      }

      setAuthState("unauthenticated");

    } catch (err) {
      console.error("Auth check failed:", err);
      // 🔥 Even on error, if key exists locally, let them in
      const savedKey = localStorage.getItem(STORAGE_KEY);
      if (savedKey && savedKey.trim().length > 0) {
        setAuthState("authenticated");
      } else {
        setAuthState("unauthenticated");
      }
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
