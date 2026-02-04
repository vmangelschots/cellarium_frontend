// src/api/regionApi.js
import { http, asList } from "./http";

/**
 * Search regions by name or country
 * @param {string} searchQuery - Search term (searches name and country fields)
 * @param {string} countryCode - Optional country code to filter regions (ISO 3166-1 alpha-2)
 * @returns {Promise<Array>} List of matching regions
 */
export async function searchRegions(searchQuery = "", countryCode = null) {
  const params = new URLSearchParams();
  if (searchQuery) {
    params.set("search", searchQuery);
  }
  if (countryCode) {
    params.set("country", countryCode);
  }
  const payload = await http(`/api/regions/?${params.toString()}`);
  return asList(payload);
}

/**
 * Create a new region
 * @param {Object} data - Region data
 * @param {string} data.name - Region name (required)
 * @param {string} data.country - Country code (optional)
 * @returns {Promise<Object>} The created region
 */
export async function createRegion(data) {
  return http("/api/regions/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Get a specific region by ID
 * @param {number} id - Region ID
 * @returns {Promise<Object>} Region details
 */
export async function getRegion(id) {
  return http(`/api/regions/${id}/`);
}

/**
 * Update a region
 * @param {number} id - Region ID
 * @param {Object} data - Updated region data
 * @returns {Promise<Object>} Updated region
 */
export async function updateRegion(id, data) {
  return http(`/api/regions/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a region
 * @param {number} id - Region ID
 * @returns {Promise<void>}
 */
export async function deleteRegion(id) {
  return http(`/api/regions/${id}/`, {
    method: "DELETE",
  });
}
