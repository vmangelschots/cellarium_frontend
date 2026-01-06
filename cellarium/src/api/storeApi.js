// src/api/stores.js
import { http, asList } from "./http";

export async function listStores() {
  const payload = await http("/api/stores/");
  return asList(payload);
}

export async function createStore({ name }) {
  return http("/api/stores/", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
