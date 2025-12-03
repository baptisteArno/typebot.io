import { createActionHandler } from "@typebot.io/forge";
import { redirect } from "../actions/redirect";

export const redirectHandler = createActionHandler(redirect, {
  web: {
    parseFunction({ options: { url } }) {
      return {
        args: {
          url: url ?? null,
        },
        content: `
          if (!url) return;
          const idMatch = url?.match(/([a-f0-9-]{36})$/);
          if (!idMatch) return;

          const action = \`blink:folder?action=open&id=\${idMatch[1]}\`;
          try {
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.openClientAction) {
              window.webkit.messageHandlers.openClientAction.postMessage(action);
            } else if (window.android && typeof window.android.openClientAction === 'function') {
              window.android.openClientAction(action);
            } else if (window.parent && window.parent !== window) {
             console.log("posting message to parent");
              window.parent.postMessage({ functionName: 'openClientAction', args: [action] }, document.referrer);
            } else {
              window.open(url, "_blank");
            }
            return false;
          } catch (error) {
            return false;
          }`,
      };
    },
  },
});
