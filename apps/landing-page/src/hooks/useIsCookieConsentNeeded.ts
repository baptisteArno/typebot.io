import { isEU } from "@/features/telemetry/server/isEU";
import { setCookie } from "@/helpers/setCookie";
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
      if (response.isEU) {
        setCookieConsentStatus("need-consent");
      } else {
        setCookie("accepted");
        setCookieConsentStatus("not-needed");
      }
    });
  }, []);

  return {
    cookieConsentStatus,
    setCookieConsentStatus,
  };
};
