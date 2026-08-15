import { logs, SeverityNumber } from "@opentelemetry/api-logs";

type GuestInvitationEvent =
  | {
      name: "attempt" | "sent";
      recipientDomain: string;
      typebotId: string;
      userId: string;
      workspaceId: string;
      workspaceSuspended: boolean;
    }
  | {
      bounceSubType?: string;
      bounceType: string;
      emailId: string;
      name: "bounce";
      recipientDomain: string;
    };

export const logGuestInvitationEvent = (event: GuestInvitationEvent) => {
  const eventName = `typebot.guest_invitation.${event.name}`;

  logger.emit({
    attributes: {
      "email.recipient.domain": event.recipientDomain,
      "event.name": eventName,
      ...(event.name === "bounce"
        ? {
            "email.bounce.type": event.bounceType,
            "email.id": event.emailId,
            ...(event.bounceSubType
              ? { "email.bounce.sub_type": event.bounceSubType }
              : {}),
          }
        : {
            "typebot.id": event.typebotId,
            "user.id": event.userId,
            "workspace.id": event.workspaceId,
            "workspace.suspended": event.workspaceSuspended,
          }),
    },
    body: `Guest invitation ${event.name}`,
    eventName,
    severityNumber:
      event.name === "bounce" ? SeverityNumber.WARN : SeverityNumber.INFO,
    severityText: event.name === "bounce" ? "WARN" : "INFO",
  });
};

const logger = logs.getLogger("@typebot.io/telemetry/guest-invitation");
