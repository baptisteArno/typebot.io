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
  url: string;
  hostEmail: string;
  guestEmail: string;
}

export const WorkspaceMemberInvitationEmail = ({
  workspaceName,
  url,
  hostEmail,
  guestEmail,
}: Props) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Logo />
          <Text style={paragraph}>
            You have been invited by {hostEmail} to collaborate on his workspace{" "}
            <strong>{workspaceName}</strong> as a team member.
            <br />
            <br />
            From now on you will see this workspace in your dashboard 👍
            <br />
            <br />
            Make sure to log in as <i>{guestEmail}</i>.
          </Text>

          <Button href={url} style={primaryButton}>
            Go to workspace
          </Button>

          <Hr style={hr} />
          <Text style={footerText}>Typebot - Build faster, Chat smarter</Text>
        </Container>
      </Body>
    </Html>
  );
};

WorkspaceMemberInvitationEmail.PreviewProps = {
  workspaceName: "My Workspace",
  url: "https://typebot.io",
  hostEmail: "host@typebot.io",
  guestEmail: "guest@typebot.io",
} as Props;

export default WorkspaceMemberInvitationEmail;

export const sendWorkspaceMemberInvitationEmail = async (
  props: ComponentProps<typeof WorkspaceMemberInvitationEmail>,
) =>
  sendEmail({
    to: props.guestEmail,
    subject: `You've been invited to collaborate`,
    html: await render(<WorkspaceMemberInvitationEmail {...props} />),
    replyTo: props.hostEmail,
  });
