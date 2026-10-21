import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import { parseNumberWithCommas } from "@typebot.io/lib/utils";
import type { SendMailOptions } from "nodemailer";
import type { ComponentProps } from "react";
import * as React from "react";
import { sendEmail } from "../helpers/sendEmail";
import { Logo } from "./components/Logo";
import {
  container,
  footerText,
  hr,
  main,
  paragraph,
  primaryButton,
} from "./styles";

void React;

interface Props {
  workspaceName: string;
  totalChatsUsed: number;
  billingCycleResetAt: Date;
}

export const UnusualUsagePausedEmail = ({
  workspaceName,
  totalChatsUsed,
  billingCycleResetAt,
}: Props) => {
  const readableChatsUsed = parseNumberWithCommas(totalChatsUsed);
  const readableResetDate = billingCycleResetAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Logo />
          <Text style={paragraph}>
            Your workspace <strong>{workspaceName}</strong> has been temporarily
            paused because its unusually high usage continued.
            <br />
            <br />
            On {readableResetDate}, we reset your billing cycle early after
            detecting an unusual number of chats. Since then, your bots have
            started {readableChatsUsed} more chats, still far above your usual
            activity.
            <br />
            <br />
            To protect you from unexpected charges, your bots will not respond
            to new conversations until this is resolved. This kind of traffic
            usually comes from a website, script or third-party service calling
            your bot automatically.
            <br />
            <br />
            If you expected this traffic, please contact our support team to
            restore access to your workspace.
          </Text>

          <Button href="mailto:support@typebot.io" style={primaryButton}>
            Contact support
          </Button>

          <Hr style={hr} />
          <Text style={footerText}>Typebot - Build faster, Chat smarter</Text>
        </Container>
      </Body>
    </Html>
  );
};

UnusualUsagePausedEmail.PreviewProps = {
  workspaceName: "My Workspace",
  totalChatsUsed: 12000,
  billingCycleResetAt: new Date("2026-08-26T06:48:32.000Z"),
} as Props;

export default UnusualUsagePausedEmail;

export const sendUnusualUsagePausedEmail = async ({
  to,
  ...props
}: Pick<SendMailOptions, "to"> &
  ComponentProps<typeof UnusualUsagePausedEmail>) =>
  sendEmail({
    to,
    subject: "Action required: Your workspace has been paused",
    html: await render(<UnusualUsagePausedEmail {...props} />),
  });
