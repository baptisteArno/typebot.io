import { beforeEach, describe, expect, it, vi } from "vitest";
import { startWhatsAppSession } from "./startWhatsAppSession";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  startSession: vi.fn(),
}));

vi.mock("@typebot.io/prisma", () => ({
  default: { publicTypebot: { findMany: mocks.findMany } },
}));

vi.mock("@typebot.io/bot-engine/startSession", () => ({
  startSession: mocks.startSession,
}));

const baseProps = {
  workspaceId: "workspace-id",
  credentials: {
    id: "credentials-id",
    provider: "meta" as const,
    systemUserAccessToken: "token",
    phoneNumberId: "phone-number-id",
  },
  contact: { name: "Jane", phoneNumber: "+15555550100" },
  sessionStore: {} as never,
};

describe("startWhatsAppSession", () => {
  beforeEach(() => {
    mocks.startSession.mockReset();
    mocks.findMany.mockResolvedValue([
      {
        settings: { whatsApp: { isEnabled: true } },
        typebot: { id: "typebot-id", publicId: "public-id" },
      },
    ]);
  });

  it("rebuilds the incoming message with the typebot id that gets started", async () => {
    const convertIncomingMessage = vi.fn(async (typebotId: string) => ({
      type: "audio" as const,
      url: `http://localhost:3000/api/typebots/${typebotId}/whatsapp/media/media-id.ogg`,
    }));

    await startWhatsAppSession({
      ...baseProps,
      incomingMessage: {
        type: "audio",
        url: "http://localhost:3000/api/typebots/undefined/whatsapp/media/media-id.ogg",
      },
      convertIncomingMessage,
    });

    expect(convertIncomingMessage).toHaveBeenCalledWith("typebot-id");
    expect(mocks.startSession.mock.calls[0]?.[0].startParams.message).toEqual({
      type: "audio",
      url: "http://localhost:3000/api/typebots/typebot-id/whatsapp/media/media-id.ogg",
    });
  });

  it("keeps the incoming message when there is nothing to rebuild", async () => {
    const incomingMessage = { type: "text" as const, text: "hi" };

    await startWhatsAppSession({ ...baseProps, incomingMessage });

    expect(mocks.startSession.mock.calls[0]?.[0].startParams.message).toEqual(
      incomingMessage,
    );
  });
});
