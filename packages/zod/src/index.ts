import { z } from "zod";
import { extendZodWithOpenApi } from "zod-openapi";
import { extendWithTypebotLayout } from "./extendWithTypebotLayout";

extendWithTypebotLayout(z);
extendZodWithOpenApi(z);

export { z };
export type { ZodLayoutMetadata } from "./extendWithTypebotLayout";
