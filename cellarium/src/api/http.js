// src/api/http.js
import { Capacitor } from "@capacitor/core";
import { getAccessToken, refreshAccessToken, clearTokens } from "./auth";

// Use full URL for native platforms, relative for web
export const API_BASE = Capacitor.isNativePlatform()
  ? import.meta.env.VITE_API_BASE_URL || "http://172.21.2.74:8000" // Update with your backend IP
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
console.log("🔍 API_BASE:", API_BASE);
console.log("🔍 Platform:", Capacitor.isNativePlatform() ? "Native" : "Web");
console.log("🔍 VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

export async function http(path, options = {}) {
  const { params, headers, _retry, skipContentTypeHeader, ...rest } = options;

  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      url.searchParams.set(k, String(v));
    });
  }

  const token = getAccessToken();

  // Build headers - skip Content-Type if explicitly told (for FormData)
  const headersList = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (!skipContentTypeHeader) {
    headersList["Content-Type"] = "application/json";
  }

  const res = await fetch(url.toString(), {
    headers: {
      ...headersList,
      ...(headers || {}),
    },
    ...rest,
  });

  // If access token expired, try refresh once and retry original request
  if (res.status === 401 && !_retry) {
    try {
      await refreshAccessToken();
      return http(path, { ...options, _retry: true });
    } catch {
      clearTokens();
      // fall through to normal error handling (useful message)
    }
  }

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.error)) ||
      (typeof data === "string" ? data : null) ||
      text ||
      `Request failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function asList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
}
