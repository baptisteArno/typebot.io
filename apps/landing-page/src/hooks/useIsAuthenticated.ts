import { getTypebotCookie } from "@typebot.io/telemetry/cookies/helpers";
import { useEffect, useState } from "react";

export const useIsAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const typebotCookie = getTypebotCookie(document.cookie);
    if (typebotCookie?.lastProvider || typebotCookie?.landingPage?.isMerged)
      setIsAuthenticated(true);
  }, []);

  return isAuthenticated;
};
