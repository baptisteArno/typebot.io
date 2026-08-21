import { describe, expect, it, mock } from "bun:test";

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";
process.env.ADMIN_EMAIL = "admin@example.com";
process.env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME = "viewer-project";
process.env.VERCEL_TEAM_ID = "team-id";
process.env.VERCEL_TOKEN = "vercel-token";

mock.module("@typebot.io/prisma", () => ({ default: {} }));

const { canReadTypebots } = await import("./databaseRules");

describe("canReadTypebots", () => {
  it("requires guests to be explicit collaborators", () => {
    expect(
      canReadTypebots("typebot-id", {
        id: "guest-id",
        email: "guest@example.com",
      }),
    ).toEqual({
      id: "typebot-id",
      OR: [
        {
          workspace: {
            members: {
              some: { userId: "guest-id", role: { not: "GUEST" } },
            },
          },
        },
        { collaborators: { some: { userId: "guest-id" } } },
      ],
    });
  });

  it("preserves administrator access to every typebot", () => {
    expect(
      canReadTypebots("typebot-id", {
        id: "admin-id",
        email: "admin@example.com",
      }),
    ).toEqual({ id: "typebot-id", OR: undefined });
  });
});
