// src/api/http.js
import { getAccessToken, refreshAccessToken, clearTokens } from "./auth";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function http(path, options = {}) {
  const { params, headers, _retry, ...rest } = options;

  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      url.searchParams.set(k, String(v));
    });
  }

  const token = getAccessToken();

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
