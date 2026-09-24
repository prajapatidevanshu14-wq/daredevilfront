import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { AdminPage } from "./pages/AdminPage.tsx";


function useHash(): string {
  const [hash, setHash] = useState<string>(
    typeof window !== "undefined" ? window.location.hash : ""
  );
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

function Root() {
  const hash = useHash();
  const isAdminRoute = hash === "#admin" || hash === "#/admin";

  // Authentication is intentionally kept only in memory. Closing or refreshing
  // the website asks for the key again; the key itself is never saved locally.
  const [authState, setAuthState] = useState<"authenticated" | "unauthenticated">(
    "unauthenticated"
  );

  // ===== Admin route =====
  if (isAdminRoute) {
    return <AdminPage />;
  }

  if (authState === "unauthenticated") {
    return <LoginPage onAuthenticated={() => setAuthState("authenticated")} />;
  }

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
