import {
  Mjml,
  MjmlBody,
  MjmlColumn,
  MjmlSection,
  MjmlSpacer,
} from "@faire/mjml-react";
import { render } from "@faire/mjml-react/utils/render";
import { env } from "@typebot.io/env";
import type { SendMailOptions } from "nodemailer";
import type { ComponentProps } from "react";
import { Button } from "../components/Button";
import { Head } from "../components/Head";
import { HeroImage } from "../components/HeroImage";
import { Text } from "../components/Text";
import { sendEmail } from "../sendEmail";

type WorkspaceMemberInvitationProps = {
  workspaceName: string;
  url: string;
  hostEmail: string;
  guestEmail: string;
};

export const WorkspaceMemberInvitation = ({
  workspaceName,
  url,
  hostEmail,
  guestEmail,
}: WorkspaceMemberInvitationProps) => (
  <Mjml>
    <Head />
    <MjmlBody width={600}>
      <MjmlSection padding="0">
        <MjmlColumn>
          <HeroImage src={`${env.NEXTAUTH_URL}/images/invitationBanner.png`} />
        </MjmlColumn>
      </MjmlSection>
      <MjmlSection padding="0 24px" cssClass="smooth">
        <MjmlColumn>
          <Text>
            You have been invited by {hostEmail} to collaborate on his workspace{" "}
            <strong>{workspaceName}</strong> as a team member.
          </Text>
          <Text>
            From now on you will see this workspace in your dashboard 👍
          </Text>
          <Text>
            Make sure to log in as <i>{guestEmail}</i>.
          </Text>
          <MjmlSpacer height="24px" />
          <Button link={url}>Go to workspace</Button>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
);

export const sendWorkspaceMemberInvitationEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, "to"> &
  ComponentProps<typeof WorkspaceMemberInvitation>) =>
  sendEmail({
    to,
    subject: "You've been invited to collaborate 🤝",
    html: render(<WorkspaceMemberInvitation {...props} />).html,
  });
