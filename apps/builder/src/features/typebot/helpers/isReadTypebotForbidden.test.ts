import { describe, expect, it } from "bun:test";
import { WorkspaceRole } from "@typebot.io/prisma/enum";

process.env.SKIP_ENV_CHECK = "true";
process.env.ENCRYPTION_SECRET = "12345678901234567890123456789012";
process.env.NEXTAUTH_URL = "https://app.typebot.io";
process.env.ADMIN_EMAIL = "admin@example.com";

const { isReadTypebotForbidden } = await import(
  "@typebot.io/typebot/helpers/isReadTypebotForbidden"
);

const activeWorkspace = {
  isSuspended: false,
  isPastDue: false,
};

describe("isReadTypebotForbidden", () => {
  it("forbids a guest who is only a workspace member", async () => {
    await expect(
      isReadTypebotForbidden(
        {
          collaborators: [],
          workspace: {
            ...activeWorkspace,
            members: [{ userId: "guest-id", role: WorkspaceRole.GUEST }],
          },
        },
        { id: "guest-id", email: "guest@example.com" },
      ),
    ).resolves.toBe(true);
  });

  it("allows a guest who is an explicit collaborator", async () => {
    await expect(
      isReadTypebotForbidden(
        {
          collaborators: [{ userId: "guest-id" }],
          workspace: {
            ...activeWorkspace,
            members: [{ userId: "guest-id", role: WorkspaceRole.GUEST }],
          },
        },
        { id: "guest-id", email: "guest@example.com" },
      ),
    ).resolves.toBe(false);
  });

  it("preserves access for non-guest workspace members", async () => {
    await expect(
      isReadTypebotForbidden(
        {
          collaborators: [],
          workspace: {
            ...activeWorkspace,
            members: [{ userId: "member-id", role: WorkspaceRole.MEMBER }],
          },
        },
        { id: "member-id", email: "member@example.com" },
      ),
    ).resolves.toBe(false);
  });

  it("preserves administrator access", async () => {
    await expect(
      isReadTypebotForbidden(
        {
          collaborators: [],
          workspace: { ...activeWorkspace, members: [] },
        },
        { id: "admin-id", email: "admin@example.com" },
      ),
    ).resolves.toBe(false);
  });
});
