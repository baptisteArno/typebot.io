import { createBlock } from "@typebot.io/forge";
import { alias } from "./actions/alias";
import { identify } from "./actions/identify";
import { trackEvent } from "./actions/trackEvent";
import { trackPage } from "./actions/trackPage";
import { auth } from "./auth";
import { SegmentLogo } from "./logo";

export const segmentBlock = createBlock({
  id: "segment",
  name: "Segment",
  tags: ["events", "analytics"],
  LightLogo: SegmentLogo,
  auth,
  actions: [alias, identify, trackPage, trackEvent],
});
