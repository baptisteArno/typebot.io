import { router } from "@/helpers/server/trpc";
import { trackClientEvents } from "./trackClientEvents";

export const telemetryRouter = router({
  trackClientEvents,
});
