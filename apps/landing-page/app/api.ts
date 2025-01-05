// app/api.ts
import {
  createStartAPIHandler,
  defaultAPIFileRouteHandler,
} from "@tanstack/start/api";

export default createStartAPIHandler(defaultAPIFileRouteHandler);
