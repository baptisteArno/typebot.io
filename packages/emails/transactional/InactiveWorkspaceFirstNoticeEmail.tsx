import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import { env } from "@typebot.io/env";
import type { SendMailOptions } from "nodemailer";
import type { ComponentProps } from "react";
// biome-ignore lint/correctness/noUnusedImports: Need it for tsx execution
import React from "react";
import { sendEmail } from "../helpers/sendEmail";
import { link } from "../marketing/styles";
import { Logo } from "./components/Logo";
import { container, footerText, hr, main, paragraph } from "./styles";

interface Props {
  workspaceId: string;
  workspaceName: string;
}

export const InactiveWorkspaceFirstNoticeEmail = ({
  workspaceId,
  workspaceName,
}: Props) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Logo />
        <Text style={paragraph}>
          It's been at least 60+ days since <strong>{workspaceName}</strong>{" "}
          workspace has been inactive. Meaning you did not log in or your
          typebots did not get any traffic in the last 60 days. <br />
          <br />
          <strong>
            We’ve automatically scheduled it for deletion in 30 days.
          </strong>{" "}
          All its typebots and collected results will be permanently deleted.
        </Text>
        <Text>
          You are receiving this email because you are an admin of that
          workspace.
        </Text>
        <Text style={paragraph}>
          To keep your workspace active, just{" "}
          <Link
            href={`${env.NEXTAUTH_URL}/typebots?workspaceId=${workspaceId}`}
          >
            log in to your Typebot account
          </Link>{" "}
          and it will be marked as active again.
        </Text>
        <Text style={paragraph}>
          This can be a good opportunity to re-explore Typebot! A lot of new
          features have been added since you last logged in including new
          blocks, more AI integrations and a ton of other improvements.
        </Text>
        <Hr style={hr} />
        <Text style={footerText}>Typebot - Build faster, Chat smarter</Text>
        <Link
          href="{{unsubscribe}}"
          target="_blank"
          style={{ ...link, color: "#898989", fontSize: "12px" }}
        >
          Unsubscribe
        </Link>
      </Container>
    </Body>
  </Html>
);

InactiveWorkspaceFirstNoticeEmail.PreviewProps = {
  workspaceName: "My Workspace",
} as Props;

export default InactiveWorkspaceFirstNoticeEmail;

export const sendInactiveWorkspaceFirstNoticeEmail = async ({
  to,
  ...props
}: Pick<SendMailOptions, "to"> &
  ComponentProps<typeof InactiveWorkspaceFirstNoticeEmail>) =>
  sendEmail({
    to,
    subject: `Your '${props.workspaceName}' workspace in Typebot is inactive and will be deleted soon`,
    html: await render(<InactiveWorkspaceFirstNoticeEmail {...props} />),
  });
