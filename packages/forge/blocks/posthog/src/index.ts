import { createBlock } from "@typebot.io/forge";
import { capture } from "./actions/capture";
import { getFlag } from "./actions/getFlag";
import { identify } from "./actions/identify";
import { identifyGroup } from "./actions/identifyGroup";
import { auth } from "./auth";
import { PosthogLogo } from "./logo";

export const posthogBlock = createBlock({
  id: "posthog",
  name: "Posthog",
  tags: ["analytics", "feature flags", "cdp"],
  LightLogo: PosthogLogo,
  auth,
  actions: [identify, identifyGroup, capture, getFlag],
});
