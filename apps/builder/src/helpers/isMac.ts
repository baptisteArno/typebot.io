declare global {
  interface Navigator {
    userAgentData?: {
      platform: string;
    };
  }
}

export const isMac = () =>
  navigator.userAgentData
    ? navigator.userAgentData.platform === "macOS"
    : /Macintosh|Mac Intel|MacPPC|Mac OS X/i.test(navigator.userAgent);
