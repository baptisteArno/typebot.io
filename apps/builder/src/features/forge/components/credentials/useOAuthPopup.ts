import { stringify } from "querystring";
import { toast } from "@/lib/toast";
import { useEffect, useRef, useState } from "react";

interface UseOAuthPopupOptions {
  /** The block definition ID for the OAuth provider */
  blockId: string;
  /** Client ID for the OAuth application. If undefined default clientId will be used */
  clientId?: string;
  /** Current workspace information */
  workspace: { id: string } | null;
  /** Timeout duration in milliseconds (default: 30000) */
  timeout?: number;
  /** Custom popup window features */
  popupFeatures?: string;
  /** Callback function when OAuth succeeds with authorization code */
  onSuccess: (code: string) => void;
  /** Callback function when OAuth fails with error */
  onError?: (error: string) => void;
}

interface UseOAuthPopupReturn {
  /** Function to open the OAuth popup and start the flow */
  openOAuthPopup: () => void;
  /** Whether the OAuth authorization is currently in progress */
  isAuthorizing: boolean;
  /** Function to manually cleanup and cancel the OAuth flow */
  cleanup: () => void;
}

/**
 * Custom hook for managing OAuth popup authentication flow.
 *
 * This hook encapsulates all the complexity of OAuth popup management including:
 * - Resource cleanup (event listeners, timeouts, popup windows)
 * - Security validations (origin checking)
 * - Error handling and user feedback
 * - Timeout management
 * - Memory leak prevention
 *
 */
export const useOAuthPopup = ({
  blockId,
  clientId,
  workspace,
  timeout = 120000,
  popupFeatures = "width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes",
  onSuccess,
  onError,
}: UseOAuthPopupOptions): UseOAuthPopupReturn => {
  const [isAuthorizing, _setIsAuthorizing] = useState(false);

  const oauthWindowRef = useRef<Window | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(
    null,
  );
  const popupCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthorizingRef = useRef(false);

  const setIsAuthorizing = (value: boolean) => {
    isAuthorizingRef.current = value;
    _setIsAuthorizing(value);
  };

  /**
   * Cleans up OAuth popup resources and resets authorization state.
   * This function handles proper cleanup of event listeners, timeouts, and popup window references.
   */
  const cleanup = () => {
    if (messageHandlerRef.current) {
      window.removeEventListener("message", messageHandlerRef.current);
      messageHandlerRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (popupCheckIntervalRef.current) {
      clearInterval(popupCheckIntervalRef.current);
      popupCheckIntervalRef.current = null;
    }

    if (oauthWindowRef.current && !oauthWindowRef.current.closed) {
      oauthWindowRef.current.close();
    }
    oauthWindowRef.current = null;

    setIsAuthorizing(false);
  };

  /**
   * Opens OAuth popup and handles the complete authentication flow with proper error handling,
   * timeout management, and security validations. This function ensures robust OAuth integration
   * by managing popup lifecycle, validating message origins, and providing comprehensive error handling.
   */
  const openOAuthPopup = () => {
    if (!workspace) {
      const errorMessage =
        "Workspace not available. Please refresh and try again.";
      toast({
        description: errorMessage,
      });
      onError?.(errorMessage);
      return;
    }

    if (isAuthorizing) {
      return;
    }

    setIsAuthorizing(true);

    try {
      const popupUrl = `/api/${blockId}/oauth/authorize?${stringify({
        clientId: clientId,
      })}`;

      const popup = window.open(popupUrl, "oauthPopup", popupFeatures);

      if (!popup || popup.closed) {
        throw new Error(
          "Popup was blocked by browser. Please allow popups for this site and try again.",
        );
      }

      oauthWindowRef.current = popup;

      timeoutRef.current = setTimeout(() => {
        cleanup();
        const errorMessage =
          "OAuth authentication timed out. Please try again.";
        toast({
          description: errorMessage,
        });
        onError?.(errorMessage);
      }, timeout);

      const handleOAuthResponse = (event: MessageEvent) => {
        const allowedOrigins = [window.location.origin];
        if (!allowedOrigins.includes(event.origin)) {
          console.warn(
            "Received OAuth message from unauthorized origin:",
            event.origin,
          );
          return;
        }

        if (event.data?.type !== "oauth") {
          return;
        }

        try {
          cleanup();

          const { code, error } = event.data;

          if (error) {
            throw new Error(`OAuth failed: ${error}`);
          }

          if (!code) {
            throw new Error(
              "No authorization code received from OAuth provider",
            );
          }

          onSuccess(code);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "OAuth authentication failed";
          toast({
            description: errorMessage,
          });
          onError?.(errorMessage);
        }
      };

      messageHandlerRef.current = handleOAuthResponse;
      window.addEventListener("message", handleOAuthResponse);

      popupCheckIntervalRef.current = setInterval(() => {
        if (popup.closed) {
          if (popupCheckIntervalRef.current) {
            clearInterval(popupCheckIntervalRef.current);
            popupCheckIntervalRef.current = null;
          }
          if (isAuthorizingRef.current) {
            cleanup();
          }
        }
      }, 1000);

      popup.focus();
    } catch (error) {
      cleanup();
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start OAuth authentication";
      toast({
        description: errorMessage,
      });
      onError?.(errorMessage);
    }
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    openOAuthPopup,
    isAuthorizing,
    cleanup,
  };
};
