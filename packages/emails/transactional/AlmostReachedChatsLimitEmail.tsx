import { Body, Container, Head, Hr, Html, Text } from "@react-email/components";
import { render } from "@react-email/render";
import { parseNumberWithCommas } from "@typebot.io/lib/utils";
import type { SendMailOptions } from "nodemailer";
import type { ComponentProps } from "react";
// biome-ignore lint/correctness/noUnusedImports: Need it for tsx execution
import React from "react";
import { sendEmail } from "../helpers/sendEmail";
import { Logo } from "./components/Logo";
import { container, footerText, hr, main, paragraph } from "./styles";

interface Props {
  usagePercent: number;
  chatsLimit: number;
  workspaceName: string;
}

export const AlmostReachedChatsLimitEmail = ({
  usagePercent,
  chatsLimit,
  workspaceName,
}: Props) => {
  const now = new Date();
  const firstDayOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
  );
  const readableResetDate = firstDayOfNextMonth
    .toDateString()
    .split(" ")
    .slice(1, 4)
    .join(" ");

  const readableChatsLimit = parseNumberWithCommas(chatsLimit);
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Logo />
          <Text style={paragraph}>
            Your workspace <strong>{workspaceName}</strong> has used{" "}
            {usagePercent}% of the included chats this month. Once you hit{" "}
            {readableChatsLimit} chats, you will pay as you go for additional
            chats.
            <br />
            <br />
            Your progress can be monitored on your workspace dashboard settings.{" "}
            <br />
            <br />
            Check out the <a href="https://typebot.io/pricing">pricing page</a>{" "}
            for information about the pay as you go tiers.
            <br />
            <br />
            As a reminder, your billing cycle ends on {readableResetDate}.
          </Text>

          <Hr style={hr} />
          <Text style={footerText}>Typebot - Build faster, Chat smarter</Text>
        </Container>
      </Body>
    </Html>
  );
};

AlmostReachedChatsLimitEmail.PreviewProps = {
  workspaceName: "My Workspace",
  chatsLimit: 2000,
  usagePercent: 95,
} as Props;

export default AlmostReachedChatsLimitEmail;

export const sendAlmostReachedChatsLimitEmail = async ({
  to,
  ...props
}: Pick<SendMailOptions, "to"> &
  ComponentProps<typeof AlmostReachedChatsLimitEmail>) =>
  sendEmail({
    to,
    subject: `You're close to your included monthly chats`,
    html: await render(<AlmostReachedChatsLimitEmail {...props} />),
  });
