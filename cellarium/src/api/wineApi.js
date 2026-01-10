// src/api/wineApi.js
import { http, asList } from "./http";

// Bottle is "consumed" when consumed_at is non-null
function isConsumed(bottle) {
  return Boolean(bottle?.consumed_at);
}

// --- Wines ---
export async function listWines() {
  const payload = await http("/api/wines/");
  return asList(payload);
}

export async function createWine(payload) {
  // If payload is FormData (has image file), send as multipart/form-data
  // Otherwise, build a JSON object for standard fields
  if (payload instanceof FormData) {
    return http("/api/wines/", {
      method: "POST",
      body: payload,
      headers: {
        // Don't set Content-Type; let the browser set it with the boundary
      },
      skipContentTypeHeader: true,
    });
  }

  // Original JSON-based approach for backward compatibility
  const body = {};
  if (payload.name != null) body.name = payload.name;
  if (payload.region != null) body.region = payload.region;
  if (payload.country != null) body.country = payload.country;
  if (payload.vintage != null) body.vintage = payload.vintage;
  if (payload.grape_varieties != null) body.grape_varieties = payload.grape_varieties;
  if (payload.wine_type != null) body.wine_type = payload.wine_type;
  if (payload.image != null) body.image = payload.image;
  if (payload.notes != null) body.notes = payload.notes;

  return http("/api/wines/", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getWine(id) {
  const wine = await http(`/api/wines/${id}/`);

  // use params instead of manual string building
  const bottlesPayload = await http(`/api/bottles/`, { params: { wine: id } });
  const bottles = asList(bottlesPayload);

  // If your backend now returns in_stock_count / bottle_count on wine list,
  // you can later stop doing this per-wine fetch for totals.
  const total_quantity = bottles.filter((b) => !isConsumed(b)).length;

  return {
    ...wine,
    total_quantity,
    bottles,
  };
}

// --- Bottles ---
export async function addBottles({
  wineId,
  count = 1,
  storeId = null,
  price = null,
  purchase_date = null, // "YYYY-MM-DD"
} = {}) {
  const n = Number(count) || 1;

  const base = { wine: Number(wineId) };
  if (storeId) base.store = Number(storeId);
  if (purchase_date) base.purchase_date = purchase_date;
  if (price !== null && price !== "" && price !== undefined) base.price = String(price);

  // fire sequentially for simplicity (fine for MVP)
  for (let i = 0; i < n; i++) {
    await http("/api/bottles/", {
      method: "POST",
      body: JSON.stringify(base),
    });
  }
}

export async function consumeBottle(bottleId) {
  return http(`/api/bottles/${bottleId}/consume/`, { method: "POST" });
}

export async function undoConsumeBottle(bottleId) {
  return http(`/api/bottles/${bottleId}/undo_consume/`, { method: "POST" });
}

export async function searchWines(q) {
  const params = new URLSearchParams();
  if (q) params.set("search", q);
  return http(`/api/wines/?${params.toString()}`);
}



export async function updateWine(id, payload) {
  // If payload is FormData (has image file), send as multipart/form-data
  if (payload instanceof FormData) {
    return http(`/api/wines/${id}/`, {
      method: "PATCH",
      body: payload,
      skipContentTypeHeader: true,
    });
  }

  // Otherwise send as JSON
  return http(`/api/wines/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function createBottle(payload) {
  return http(`/api/bottles/`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}