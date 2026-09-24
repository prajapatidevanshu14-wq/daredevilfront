import { supabase } from "./supabase";

let sessionToken: string | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let pending: Record<string, unknown> = {};

export type CloudLoginResult = {
  success: boolean;
  error?: string;
  session_token?: string;
  cloud_data?: Record<string, unknown> | null;
  has_cloud_data?: boolean;
};

export function setCloudSession(token: string) {
  sessionToken = token;
}

export function clearCloudSession() {
  sessionToken = null;
  pending = {};
  if (timer) clearTimeout(timer);
  timer = null;
}

export async function loginWithAccessKey(key: string, fingerprint: string): Promise<CloudLoginResult> {
  const { data, error } = await supabase.rpc("login_with_access_key", {
    p_key: key,
    p_fingerprint: fingerprint,
  });
  if (error) throw error;
  return data as CloudLoginResult;
}

export function applyCloudData(data: Record<string, unknown> | null | undefined) {
  if (!data) return;
  const mapping: Record<string, string> = {
    orders: "dev-smm-orders",
    apis: "dev-smm-apis",
    bundles: "dev-smm-bundles",
    activeRatios: "dev-smm-active-ratios",
    ratioPresets: "dev-smm-ratio-presets",
  };
  for (const [cloudKey, localKey] of Object.entries(mapping)) {
    // Old browser data may contain null. Never replace safe app defaults with null.
    if (data[cloudKey] !== undefined && data[cloudKey] !== null) {
      localStorage.setItem(localKey, JSON.stringify(data[cloudKey]));
    } else if (data[cloudKey] === null) {
      localStorage.removeItem(localKey);
    }
  }
}

export function getLocalDataForMigration(): Record<string, unknown> {
  const read = (key: string, fallback: unknown) => {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  };
  return {
    orders: read("dev-smm-orders", []),
    apis: read("dev-smm-apis", []),
    bundles: read("dev-smm-bundles", []),
    activeRatios: read("dev-smm-active-ratios", null),
    ratioPresets: read("dev-smm-ratio-presets", []),
  };
}

export async function saveCloudPatchNow(patch: Record<string, unknown>) {
  if (!sessionToken) return;
  const { error } = await supabase.rpc("save_customer_data", {
    p_session_token: sessionToken,
    p_patch: patch,
  });
  if (error) throw error;
}

export function scheduleCloudSave(patch: Record<string, unknown>) {
  pending = { ...pending, ...patch };
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    const current = pending;
    pending = {};
    timer = null;
    try {
      await saveCloudPatchNow(current);
    } catch (error) {
      console.error("Cloud save failed:", error);
      pending = { ...current, ...pending };
    }
  }, 500);
}
