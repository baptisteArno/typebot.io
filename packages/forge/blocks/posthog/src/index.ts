import { createBlock } from "@typebot.io/forge";
import { capture } from "./actions/capture";
import { identifyGroup } from "./actions/identifyGroup";
import { auth } from "./auth";
import { PosthogLogo } from "./logo";

export const posthogBlock = createBlock({
  id: "posthog",
  name: "Posthog",
  tags: ["analytics", "feature flags", "cdp"],
  LightLogo: PosthogLogo,
  auth,
  actions: [capture, identifyGroup],
  docsUrl: "https://docs.typebot.io/editor/blocks/integrations/posthog",
});
