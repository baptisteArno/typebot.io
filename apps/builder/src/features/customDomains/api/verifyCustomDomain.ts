import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import {
  type DomainResponse,
  type DomainVerificationStatus,
  domainResponseSchema,
  domainVerificationStatusSchema,
} from "@typebot.io/schemas/features/customDomains";
import { z } from "@typebot.io/zod";
import type {
  DomainConfigResponse,
  DomainVerificationResponse,
} from "../types";

export const verifyCustomDomain = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/custom-domains/{name}/verify",
      protect: true,
      summary: "Verify domain config",
      tags: ["Custom domains"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      name: z.string(),
    }),
  )
  .output(
    z.object({
      status: domainVerificationStatusSchema,
      domainJson: domainResponseSchema,
    }),
  )
  .query(async ({ input: { workspaceId, name }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      select: {
        members: {
          select: {
            userId: true,
            role: true,
          },
        },
      },
    });

    if (!workspace || isWriteWorkspaceForbidden(workspace, user))
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No workspaces found",
      });

    let status: DomainVerificationStatus = "Valid Configuration";

    const [domainJson, configJson] = await Promise.all([
      getDomainResponse(name),
      getConfigResponse(name),
    ]);

    if (domainJson?.error?.code === "not_found") {
      status = "Domain Not Found";
    } else if (domainJson.error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: domainJson.error.message,
      });
    } else if (!domainJson.verified) {
      status = "Pending Verification";
      const verificationJson = await verifyDomain(name);

      if (verificationJson && verificationJson.verified) {
        status = "Valid Configuration";
      }
    } else if (configJson.misconfigured) {
      status = "Invalid Configuration";
    } else {
      status = "Valid Configuration";
    }

    return {
      status,
      domainJson,
    };
  });

const getDomainResponse = async (
  domain: string,
): Promise<DomainResponse & { error: { code: string; message: string } }> => {
  return await fetch(
    `https://api.vercel.com/v9/projects/${env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME}/domains/${domain}?teamId=${env.VERCEL_TEAM_ID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  ).then((res) => {
    return res.json();
  });
};

const getConfigResponse = async (
  domain: string,
): Promise<DomainConfigResponse> => {
  return await fetch(
    `https://api.vercel.com/v6/domains/${domain}/config?teamId=${env.VERCEL_TEAM_ID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  ).then((res) => res.json());
};

const verifyDomain = async (
  domain: string,
): Promise<DomainVerificationResponse> => {
  return await fetch(
    `https://api.vercel.com/v9/projects/${env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME}/domains/${domain}/verify?teamId=${env.VERCEL_TEAM_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  ).then((res) => res.json());
};
