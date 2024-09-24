import type { PixelBlock } from "@typebot.io/blocks-integrations/pixel/schema";

declare const window: {
  fbq?: (
    arg1: string,
    arg4: string,
    arg2: string,
    arg3: Record<string, string> | undefined,
  ) => void;
};

export const initPixel = (pixelIds: string[]) => {
  const script = document.createElement("script");
  script.innerHTML = `!function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  ${pixelIds.map((pixelId) => `fbq('init', '${pixelId}');`).join("\n")}
  fbq('track', 'PageView');`;
  document.head.appendChild(script);
};

export const trackPixelEvent = (options: PixelBlock["options"]) => {
  if (!options?.eventType || !options.pixelId) return;
  if (!window.fbq) {
    console.error("Facebook Pixel was not properly initialized");
    return;
  }
  const params = options.params?.length
    ? options.params.reduce<Record<string, string>>((obj, param) => {
        if (!param.key || !param.value) return obj;
        return { ...obj, [param.key]: param.value };
      }, {})
    : undefined;
  if (options.eventType === "Custom") {
    if (!options.name) return;
    window.fbq("trackSingleCustom", options.pixelId, options.name, params);
  }
  window.fbq("trackSingle", options.pixelId, options.eventType, params);
};
