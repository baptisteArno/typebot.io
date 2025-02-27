// app/api.ts
import {
  createStartAPIHandler,
  defaultAPIFileRouteHandler,
} from "@tanstack/react-start/api";

export default createStartAPIHandler(defaultAPIFileRouteHandler);
