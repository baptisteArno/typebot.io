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
// biome-ignore lint/correctness/noUnusedImports: Need it for tsx execution
import React from "react";
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

interface Props {
  workspaceName: string;
  totalChatsUsed: number;
}

export const BillingCycleResetFailedEmail = ({
  workspaceName,
  totalChatsUsed,
}: Props) => {
  const readableChatsUsed = parseNumberWithCommas(totalChatsUsed);

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Logo />
          <Text style={paragraph}>
            Your workspace <strong>{workspaceName}</strong> has been temporarily
            paused due to a payment issue.
            <br />
            <br />
            We detected {readableChatsUsed} chats in a short period, which
            exceeded our fraud prevention threshold. We attempted to charge your
            account and reset your billing cycle, but the payment failed.
            <br />
            <br />
            Your workspace has been paused to prevent further charges. Your bots
            will not respond to new conversations until this is resolved.
            <br />
            <br />
            Please contact our support team to resolve this issue and restore
            access to your workspace.
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

BillingCycleResetFailedEmail.PreviewProps = {
  workspaceName: "My Workspace",
  totalChatsUsed: 15000,
} as Props;

export default BillingCycleResetFailedEmail;

export const sendBillingCycleResetFailedEmail = async ({
  to,
  ...props
}: Pick<SendMailOptions, "to"> &
  ComponentProps<typeof BillingCycleResetFailedEmail>) =>
  sendEmail({
    to,
    subject: "Action required: Your workspace has been paused",
    html: await render(<BillingCycleResetFailedEmail {...props} />),
  });
