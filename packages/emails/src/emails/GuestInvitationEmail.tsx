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

type GuestInvitationEmailProps = {
  workspaceName: string;
  typebotName: string;
  url: string;
  hostEmail: string;
  guestEmail: string;
};

export const GuestInvitationEmail = ({
  workspaceName,
  typebotName,
  url,
  hostEmail,
  guestEmail,
}: GuestInvitationEmailProps) => (
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
            You have been invited by {hostEmail} to collaborate on his typebot{" "}
            <strong>{typebotName}</strong>.
          </Text>
          <Text>
            From now on you will see this typebot in your dashboard under his
            workspace &quot;{workspaceName}&quot; 👍
          </Text>
          <Text>
            Make sure to log in as <i>{guestEmail}</i>.
          </Text>
          <MjmlSpacer height="24px" />
          <Button link={url}>Go to typebot</Button>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
);

export const sendGuestInvitationEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, "to"> & ComponentProps<typeof GuestInvitationEmail>) =>
  sendEmail({
    to,
    subject: "You've been invited to collaborate 🤝",
    html: render(<GuestInvitationEmail {...props} />).html,
  });
