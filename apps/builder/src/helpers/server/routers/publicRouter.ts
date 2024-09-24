import { analyticsRouter } from "@/features/analytics/api/router";
import { billingRouter } from "@/features/billing/api/router";
import { webhookRouter } from "@/features/blocks/integrations/webhook/api/router";
import { getLinkedTypebots } from "@/features/blocks/logic/typebotLink/api/getLinkedTypebots";
import { collaboratorsRouter } from "@/features/collaboration/api/router";
import { credentialsRouter } from "@/features/credentials/api/router";
import { customDomainsRouter } from "@/features/customDomains/api/router";
import { folderRouter } from "@/features/folders/api/router";
import { resultsRouter } from "@/features/results/api/router";
import { themeRouter } from "@/features/theme/api/router";
import { typebotRouter } from "@/features/typebot/api/router";
import { publicWhatsAppRouter } from "@/features/whatsapp/router";
import { workspaceRouter } from "@/features/workspace/api/router";
import { router } from "../trpc";

export const publicRouter = router({
  getLinkedTypebots,
  analytics: analyticsRouter,
  workspace: workspaceRouter,
  typebot: typebotRouter,
  webhook: webhookRouter,
  results: resultsRouter,
  billing: billingRouter,
  credentials: credentialsRouter,
  theme: themeRouter,
  collaborators: collaboratorsRouter,
  customDomains: customDomainsRouter,
  whatsApp: publicWhatsAppRouter,
  folders: folderRouter,
});

export type PublicRouter = typeof publicRouter;
