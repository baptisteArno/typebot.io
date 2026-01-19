import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import {
  customDomainSchema,
  domainResponseSchema,
  domainVerificationStatusSchema,
} from "@typebot.io/schemas/features/customDomains";
import { z } from "zod";
import {
  createCustomDomainInputSchema,
  handleCreateCustomDomain,
} from "./handleCreateCustomDomain";
import {
  deleteCustomDomainInputSchema,
  handleDeleteCustomDomain,
} from "./handleDeleteCustomDomain";
import {
  handleListCustomDomains,
  listCustomDomainsInputSchema,
} from "./handleListCustomDomains";
import {
  handleVerifyCustomDomain,
  verifyCustomDomainInputSchema,
} from "./handleVerifyCustomDomain";

export const customDomainsRouter = {
  createCustomDomain: authenticatedProcedure
    .route({
      method: "POST",
      path: "/v1/custom-domains",
      summary: "Create custom domain",
      tags: ["Custom domains"],
    })
    .input(createCustomDomainInputSchema)
    .output(
      z.object({
        customDomain: customDomainSchema.pick({
          name: true,
          createdAt: true,
        }),
      }),
    )
    .handler(handleCreateCustomDomain),

  deleteCustomDomain: authenticatedProcedure
    .route({
      method: "DELETE",
      path: "/v1/custom-domains/{name}",
      summary: "Delete custom domain",
      tags: ["Custom domains"],
    })
    .input(deleteCustomDomainInputSchema)
    .output(
      z.object({
        message: z.literal("success"),
      }),
    )
    .handler(handleDeleteCustomDomain),

  listCustomDomains: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/custom-domains",
      summary: "List custom domains",
      tags: ["Custom domains"],
    })
    .input(listCustomDomainsInputSchema)
    .output(
      z.object({
        customDomains: z.array(
          customDomainSchema.pick({
            name: true,
            createdAt: true,
          }),
        ),
      }),
    )
    .handler(handleListCustomDomains),

  verifyCustomDomain: authenticatedProcedure
    .route({
      method: "GET",
      path: "/v1/custom-domains/{name}/verify",
      summary: "Verify domain config",
      tags: ["Custom domains"],
    })
    .input(verifyCustomDomainInputSchema)
    .output(
      z.object({
        status: domainVerificationStatusSchema,
        domainJson: domainResponseSchema,
      }),
    )
    .handler(handleVerifyCustomDomain),
};
