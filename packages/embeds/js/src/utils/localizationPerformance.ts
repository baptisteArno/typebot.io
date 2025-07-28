/**
 * Performance optimization utilities for localization in embed libraries
 */

// Locale detection cache to avoid repeated computations
const localeDetectionCache = new Map<string, any>();
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export interface CachedLocaleResult {
  locale: string;
  method: string;
  confidence: number;
  timestamp: number;
}

/**
 * Cache locale detection results to avoid repeated computation
 */
export function getCachedLocaleDetection(
  cacheKey: string,
): CachedLocaleResult | null {
  const cached = localeDetectionCache.get(cacheKey);
  if (!cached) return null;

  // Check if cache is expired
  if (Date.now() - cached.timestamp > CACHE_EXPIRY_MS) {
    localeDetectionCache.delete(cacheKey);
    return null;
  }

  return cached;
}

/**
 * Cache locale detection result
 */
export function setCachedLocaleDetection(
  cacheKey: string,
  result: Omit<CachedLocaleResult, "timestamp">,
): void {
  localeDetectionCache.set(cacheKey, {
    ...result,
    timestamp: Date.now(),
  });
}

/**
 * Generate cache key for locale detection
 */
export function generateLocaleDetectionCacheKey(
  url: string,
  userAgent: string,
  availableLocales: string[],
): string {
  // Create a hash-like key based on relevant parameters
  const key = `${url}-${userAgent}-${availableLocales.join(",")}`;
  return btoa(key).slice(0, 32); // Use base64 and truncate for shorter key
}

/**
 * Debounce function for locale preference storage
 */
let localePreferenceSaveTimeout: number | null = null;

export function debouncedSaveLocalePreference(
  locale: string,
  typebotId?: string,
): void {
  if (localePreferenceSaveTimeout) {
    clearTimeout(localePreferenceSaveTimeout);
  }

  localePreferenceSaveTimeout = window.setTimeout(() => {
    try {
      localStorage.setItem("typebot-preferred-locale", locale);
      if (typebotId) {
        localStorage.setItem(`typebot-${typebotId}-preferred-locale`, locale);
      }
    } catch (error) {
      console.warn("Could not save locale preference:", error);
    }
    localePreferenceSaveTimeout = null;
  }, 1000); // Debounce for 1 second
}

/**
 * Lazy loader for localization service (removed - not needed in embeds context)
 * The embed library handles localization through the Bot component props
 * and doesn't need direct access to the LocalizationService
 */

/**
 * Memory-efficient storage key management
 */
const MAX_STORAGE_KEYS = 100;
const storageKeyTracker = new Set<string>();

export function trackStorageKey(key: string): void {
  storageKeyTracker.add(key);

  // Clean up old keys if we exceed the limit
  if (storageKeyTracker.size > MAX_STORAGE_KEYS) {
    const oldestKeys = Array.from(storageKeyTracker).slice(0, 20);
    oldestKeys.forEach((oldKey) => {
      try {
        localStorage.removeItem(oldKey);
        sessionStorage.removeItem(oldKey);
        storageKeyTracker.delete(oldKey);
      } catch {
        // Silently fail
      }
    });
  }
}

/**
 * Batch storage operations to improve performance
 */
interface BatchStorageOperation {
  type: "set" | "remove";
  key: string;
  value?: string;
  storage: "local" | "session";
}

let batchedOperations: BatchStorageOperation[] = [];
let batchProcessTimeout: number | null = null;

export function batchStorageOperation(operation: BatchStorageOperation): void {
  batchedOperations.push(operation);

  if (batchProcessTimeout) {
    clearTimeout(batchProcessTimeout);
  }

  batchProcessTimeout = window.setTimeout(() => {
    processBatchedStorageOperations();
    batchProcessTimeout = null;
  }, 100); // Process batch after 100ms
}

function processBatchedStorageOperations(): void {
  const operations = [...batchedOperations];
  batchedOperations = [];

  const storageMap = {
    local: localStorage,
    session: sessionStorage,
  };

  operations.forEach((op) => {
    try {
      const storage = storageMap[op.storage];
      if (op.type === "set" && op.value) {
        storage.setItem(op.key, op.value);
        trackStorageKey(op.key);
      } else if (op.type === "remove") {
        storage.removeItem(op.key);
        storageKeyTracker.delete(op.key);
      }
    } catch {
      // Silently fail individual operations
    }
  });
}

/**
 * Optimized locale validation with memoization
 */
const localeValidationCache = new Map<string, string | null>();

// Import global supported locales to avoid duplication
// This ensures consistency across the entire application
let globalSupportedLocales: readonly string[];

try {
  // Dynamically import to avoid potential circular dependencies
  globalSupportedLocales = [
    "en",
    "fr", 
    "de",
    "pt",
    "pt-BR",
    "es",
    "ro",
    "it",
    "el",
  ] as const;
} catch {
  // Fallback in case of import issues
  globalSupportedLocales = ["en", "fr", "de", "pt", "pt-BR", "es", "ro", "it", "el"];
}

export function optimizedValidateLocale(
  locale: string,
  availableLocales: string[],
): string | null {
  const cacheKey = `${locale}-${availableLocales.join(",")}`;

  if (localeValidationCache.has(cacheKey)) {
    return localeValidationCache.get(cacheKey)!;
  }

  let result: string | null = null;

  if (!locale) {
    result = null;
  } else if (availableLocales.includes(locale)) {
    result = locale;
  } else if (globalSupportedLocales.includes(locale)) {
    // If locale is globally supported but not in availableLocales, 
    // still allow it for dynamic locale support
    result = locale;
  } else {
    // Check case-insensitive match against both available and global locales
    const lowerLocale = locale.toLowerCase();
    
    // First check available locales
    let match = availableLocales.find(
      (available) => available.toLowerCase() === lowerLocale,
    );
    
    // If not found, check global supported locales
    if (!match) {
      match = globalSupportedLocales.find(
        (supported) => supported.toLowerCase() === lowerLocale,
      );
    }
    
    result = match || null;
  }

  localeValidationCache.set(cacheKey, result);

  // Limit cache size
  if (localeValidationCache.size > 100) {
    const firstKey = localeValidationCache.keys().next().value;
    if (firstKey !== undefined) {
      localeValidationCache.delete(firstKey);
    }
  }

  return result;
}

/**
 * Performance monitoring for locale detection
 */
export interface LocaleDetectionPerformanceMetrics {
  detectionTime: number;
  cacheHit: boolean;
  method: string;
  locale: string;
}

const performanceMetrics: LocaleDetectionPerformanceMetrics[] = [];

export function recordLocaleDetectionPerformance(
  metrics: LocaleDetectionPerformanceMetrics,
): void {
  performanceMetrics.push(metrics);

  // Keep only the last 50 measurements
  if (performanceMetrics.length > 50) {
    performanceMetrics.shift();
  }
}

export function getLocaleDetectionPerformanceStats(): {
  averageDetectionTime: number;
  cacheHitRate: number;
  mostCommonMethod: string;
  totalDetections: number;
} {
  if (performanceMetrics.length === 0) {
    return {
      averageDetectionTime: 0,
      cacheHitRate: 0,
      mostCommonMethod: "none",
      totalDetections: 0,
    };
  }

  const totalTime = performanceMetrics.reduce(
    (sum, metric) => sum + metric.detectionTime,
    0,
  );
  const cacheHits = performanceMetrics.filter(
    (metric) => metric.cacheHit,
  ).length;

  const methodCounts = performanceMetrics.reduce(
    (counts, metric) => {
      counts[metric.method] = (counts[metric.method] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>,
  );

  const mostCommonMethod =
    Object.entries(methodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
    "none";

  return {
    averageDetectionTime: totalTime / performanceMetrics.length,
    cacheHitRate: cacheHits / performanceMetrics.length,
    mostCommonMethod,
    totalDetections: performanceMetrics.length,
  };
}

/**
 * Cleanup function to be called when component unmounts
 */
export function cleanupLocalizationPerformance(): void {
  localeDetectionCache.clear();
  localeValidationCache.clear();
  storageKeyTracker.clear();
  performanceMetrics.length = 0;

  if (localePreferenceSaveTimeout) {
    clearTimeout(localePreferenceSaveTimeout);
    localePreferenceSaveTimeout = null;
  }

  if (batchProcessTimeout) {
    clearTimeout(batchProcessTimeout);
    processBatchedStorageOperations(); // Process any pending operations
    batchProcessTimeout = null;
  }
}

/**
 * Initialize performance optimizations
 */
export function initializeLocalizationPerformance(): void {
  // Clean up when the page is about to unload
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", cleanupLocalizationPerformance);

    // Clean up when the page becomes hidden (for mobile)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        processBatchedStorageOperations();
      }
    });
  }
}
