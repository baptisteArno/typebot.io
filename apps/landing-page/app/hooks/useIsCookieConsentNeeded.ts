import { isEU } from "@/features/telemetry/server/isEU";
import { getTypebotCookie } from "@typebot.io/telemetry/cookies/helpers";
import { useEffect, useState } from "react";

export const useCookieConsentStatus = () => {
  const [cookieConsentStatus, setCookieConsentStatus] = useState<
    "accepted" | "declined" | "need-consent" | "not-needed"
  >();

  useEffect(() => {
    const typebotCookie = getTypebotCookie(document.cookie);
    if (typebotCookie) {
      setCookieConsentStatus(
        typebotCookie.consent === "declined" ? "declined" : "accepted",
      );
      return;
    }

    isEU().then((response) => {
      setCookieConsentStatus(response.isEU ? "need-consent" : "not-needed");
    });
  }, []);

  return {
    cookieConsentStatus,
    setCookieConsentStatus,
  };
};
