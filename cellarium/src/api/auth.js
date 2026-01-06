// src/api/auth.js
import { http } from "./http";

const ACCESS_KEY = "cellarium_access";
const REFRESH_KEY = "cellarium_refresh";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  notifyAuthRequired();
}

export async function login({ username, password }) {
  const data = await http("/api/auth/token/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setTokens(data);
  return data;
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token stored.");

  const data = await http("/api/auth/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });

  // refresh endpoint returns { access }, keep existing refresh
  setTokens({ access: data.access });
  return data.access;
}
export function notifyAuthRequired() {
  window.dispatchEvent(new Event("auth:required"));
}
