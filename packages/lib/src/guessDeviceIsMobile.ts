// Copied from https://github.com/juliangruber/is-mobile/blob/main/index.js

const mobileRE =
  /(android|bb\d+|meego).+mobile|armv7l|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|redmi|series[46]0|samsungbrowser.*mobile|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;
const notMobileRE = /CrOS/;

const tabletRE = /android|ipad|playbook|silk/i;

export const guessDeviceIsMobile = (opts?: { includeTablet?: boolean }) => {
  const ua = navigator.userAgent;

  let result =
    (mobileRE.test(ua) && !notMobileRE.test(ua)) ||
    (!!opts?.includeTablet && tabletRE.test(ua));

  if (
    !result &&
    opts?.includeTablet &&
    navigator.maxTouchPoints > 1 &&
    ua.indexOf("Macintosh") !== -1 &&
    ua.indexOf("Safari") !== -1
  ) {
    result = true;
  }

  return result;
};
