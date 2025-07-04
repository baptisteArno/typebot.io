import { createServerFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";

const EU_COUNTRIES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "IS",
  "LI",
  "NO",
]);

export const isEU = createServerFn().handler(() => {
  const headers = getHeaders();
  const countryCode = headers["cf-ipcountry"]?.toUpperCase();
  if (!countryCode) return { isEU: true };
  return { isEU: EU_COUNTRIES.has(countryCode) };
});
