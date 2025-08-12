import type { StartChatResponse } from "@typebot.io/chat-api/schemas";
import { batchStorageOperation } from "./localizationPerformance";
import { getStorage } from "./storage";

/**
 * Localized storage utilities for embed libraries
 * These utilities extend the base storage system to support locale-specific data storage
 */

export interface LocalizedStorageData {
  locale: string;
  data: any;
  timestamp: number;
  version: string;
}

const LOCALIZED_STORAGE_VERSION = "1.0";

/**
 * Get locale-specific result ID from storage
 */
export const getLocalizedResultIdFromStorage = (
  typebotId: string,
  locale: string,
): string | undefined => {
  if (!typebotId || !locale) return;

  try {
    const key = `resultId-${typebotId}-${locale}`;
    return (
      sessionStorage.getItem(key) ?? localStorage.getItem(key) ?? undefined
    );
  } catch {
    return undefined;
  }
};

/**
 * Set locale-specific result ID in storage
 */
export const setLocalizedResultIdInStorage =
  (storageType: "local" | "session" = "session") =>
  (typebotId: string, locale: string, resultId: string) => {
    if (!typebotId || !locale || !resultId) return;

    const key = `resultId-${typebotId}-${locale}`;
    batchStorageOperation({
      type: "set",
      key,
      value: resultId,
      storage: storageType,
    });
  };

/**
 * Get locale-specific initial chat reply from storage
 */
export const getLocalizedInitialChatReplyFromStorage = (
  typebotId: string,
  locale: string,
): StartChatResponse | undefined => {
  if (!typebotId || !locale) return;

  try {
    const key = `typebot-${typebotId}-initialChatReply-${locale}`;
    const rawData = sessionStorage.getItem(key) ?? localStorage.getItem(key);

    if (!rawData) return;

    const parsedData = JSON.parse(rawData) as LocalizedStorageData;

    // Check version compatibility
    if (parsedData.version !== LOCALIZED_STORAGE_VERSION) {
      // Clean up outdated data
      sessionStorage.removeItem(key);
      localStorage.removeItem(key);
      return;
    }

    return parsedData.data as StartChatResponse;
  } catch {
    return undefined;
  }
};

/**
 * Set locale-specific initial chat reply in storage
 */
export const setLocalizedInitialChatReplyInStorage = (
  initialChatReply: StartChatResponse,
  {
    typebotId,
    locale,
    storage,
  }: {
    typebotId: string;
    locale: string;
    storage?: "local" | "session";
  },
) => {
  if (!typebotId || !locale) return;

  try {
    const localizedData: LocalizedStorageData = {
      locale,
      data: initialChatReply,
      timestamp: Date.now(),
      version: LOCALIZED_STORAGE_VERSION,
    };

    const key = `typebot-${typebotId}-initialChatReply-${locale}`;
    const rawData = JSON.stringify(localizedData);

    batchStorageOperation({
      type: "set",
      key,
      value: rawData,
      storage: storage === "local" ? "local" : "session",
    });
  } catch {
    // Silently fail
  }
};

/**
 * Get user's preferred locale from storage
 */
export const getPreferredLocaleFromStorage = (
  typebotId?: string,
): string | null => {
  try {
    // Try typebot-specific preference first
    if (typebotId) {
      const typebotSpecific = localStorage.getItem(
        `typebot-${typebotId}-preferred-locale`,
      );
      if (typebotSpecific) return typebotSpecific;
    }

    // Fall back to global preference
    return localStorage.getItem("typebot-preferred-locale");
  } catch {
    return null;
  }
};

/**
 * Set user's preferred locale in storage
 */
export const setPreferredLocaleInStorage = (
  locale: string,
  typebotId?: string,
): void => {
  if (!locale) return;

  try {
    // Save global preference
    localStorage.setItem("typebot-preferred-locale", locale);

    // Save typebot-specific preference if provided
    if (typebotId) {
      localStorage.setItem(`typebot-${typebotId}-preferred-locale`, locale);
    }
  } catch {
    // Silently fail
  }
};

/**
 * Get locale-specific chat progress from storage
 */
export const getLocalizedChatProgressFromStorage = (
  typebotId: string,
  locale: string,
): number | undefined => {
  if (!typebotId || !locale) return;

  try {
    const key = `typebot-${typebotId}-progress-${locale}`;
    const rawValue = sessionStorage.getItem(key) ?? localStorage.getItem(key);

    if (!rawValue) return;

    const progress = Number.parseInt(rawValue, 10);
    return isNaN(progress) ? undefined : progress;
  } catch {
    return undefined;
  }
};

/**
 * Set locale-specific chat progress in storage
 */
export const setLocalizedChatProgressInStorage = (
  typebotId: string,
  locale: string,
  progress: number,
  storageType: "local" | "session" = "session",
): void => {
  if (!typebotId || !locale || typeof progress !== "number") return;

  try {
    const key = `typebot-${typebotId}-progress-${locale}`;
    getStorage(storageType).setItem(key, progress.toString());
  } catch {
    // Silently fail
  }
};

/**
 * Wipe all locale-specific chat state from storage
 */
export const wipeLocalizedChatStateInStorage = (
  typebotId: string,
  locale?: string,
): void => {
  if (!typebotId) return;

  try {
    const pattern = locale
      ? `typebot-${typebotId}-.*-${locale}`
      : `typebot-${typebotId}-.*-[a-z]{2}(-[A-Z]{2})?`;

    const regex = new RegExp(pattern);

    // Clean localStorage
    Object.keys(localStorage).forEach((key) => {
      if (regex.test(key)) {
        localStorage.removeItem(key);
      }
    });

    // Clean sessionStorage
    Object.keys(sessionStorage).forEach((key) => {
      if (regex.test(key)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {
    // Silently fail
  }
};

/**
 * Migrate existing non-localized storage to localized storage
 */
export const migrateToLocalizedStorage = (
  typebotId: string,
  locale: string,
): void => {
  if (!typebotId || !locale) return;

  try {
    // Migrate result ID
    const existingResultId =
      sessionStorage.getItem(`resultId-${typebotId}`) ??
      localStorage.getItem(`resultId-${typebotId}`);

    if (existingResultId) {
      setLocalizedResultIdInStorage("session")(
        typebotId,
        locale,
        existingResultId,
      );
      // Clean up old key
      sessionStorage.removeItem(`resultId-${typebotId}`);
      localStorage.removeItem(`resultId-${typebotId}`);
    }

    // Migrate initial chat reply
    const existingChatReply =
      sessionStorage.getItem(`typebot-${typebotId}-initialChatReply`) ??
      localStorage.getItem(`typebot-${typebotId}-initialChatReply`);

    if (existingChatReply) {
      try {
        const parsedReply = JSON.parse(existingChatReply) as StartChatResponse;
        setLocalizedInitialChatReplyInStorage(parsedReply, {
          typebotId,
          locale,
          storage: "session",
        });
        // Clean up old key
        sessionStorage.removeItem(`typebot-${typebotId}-initialChatReply`);
        localStorage.removeItem(`typebot-${typebotId}-initialChatReply`);
      } catch {
        // If parsing fails, just remove the old key
        sessionStorage.removeItem(`typebot-${typebotId}-initialChatReply`);
        localStorage.removeItem(`typebot-${typebotId}-initialChatReply`);
      }
    }

    // Migrate progress value
    const existingProgress =
      sessionStorage.getItem(`typebot-${typebotId}-progressValue`) ??
      localStorage.getItem(`typebot-${typebotId}-progressValue`);

    if (existingProgress) {
      const progress = Number.parseInt(existingProgress, 10);
      if (!isNaN(progress)) {
        setLocalizedChatProgressInStorage(
          typebotId,
          locale,
          progress,
          "session",
        );
      }
      // Clean up old key
      sessionStorage.removeItem(`typebot-${typebotId}-progressValue`);
      localStorage.removeItem(`typebot-${typebotId}-progressValue`);
    }
  } catch {
    // Silently fail migration
  }
};

/**
 * Get available locales from storage based on stored data
 */
export const getAvailableLocalesFromStorage = (typebotId: string): string[] => {
  if (!typebotId) return [];

  try {
    const locales = new Set<string>();
    const pattern = new RegExp(
      `typebot-${typebotId}-.*-([a-z]{2}(-[A-Z]{2})?)$`,
    );

    // Check localStorage
    Object.keys(localStorage).forEach((key) => {
      const match = key.match(pattern);
      if (match && match[1]) {
        locales.add(match[1]);
      }
    });

    // Check sessionStorage
    Object.keys(sessionStorage).forEach((key) => {
      const match = key.match(pattern);
      if (match && match[1]) {
        locales.add(match[1]);
      }
    });

    return Array.from(locales).sort();
  } catch {
    return [];
  }
};

/**
 * Check storage quota and clean up old localized data if needed
 */
export const cleanupLocalizedStorage = (typebotId: string): void => {
  if (!typebotId) return;

  try {
    // Simple cleanup: remove data older than 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const pattern = new RegExp(`typebot-${typebotId}-.*-[a-z]{2}(-[A-Z]{2})?$`);

    [localStorage, sessionStorage].forEach((storage) => {
      Object.keys(storage).forEach((key) => {
        if (pattern.test(key)) {
          try {
            const rawData = storage.getItem(key);
            if (rawData) {
              const data = JSON.parse(rawData) as LocalizedStorageData;
              if (data.timestamp && data.timestamp < thirtyDaysAgo) {
                storage.removeItem(key);
              }
            }
          } catch {
            // If we can't parse the data, it might be corrupt, so remove it
            storage.removeItem(key);
          }
        }
      });
    });
  } catch {
    // Silently fail cleanup
  }
};
