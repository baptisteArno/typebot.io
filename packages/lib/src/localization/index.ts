// Main exports for the localization package
export * from "./types";
export * from "./contentResolver";
export * from "./localeDetection";
export * from "./LocalizationService";

// Re-export the singleton service for convenience
export { localizationService as default } from "./LocalizationService";
