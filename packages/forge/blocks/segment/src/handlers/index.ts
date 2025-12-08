import { aliasHandler } from "./aliasHandler";
import { identifyHandler } from "./identifyHandler";
import { trackEventHandler } from "./trackEventHandler";
import { trackPageHandler } from "./trackPageHandler";

export default [
  aliasHandler,
  identifyHandler,
  trackPageHandler,
  trackEventHandler,
];
