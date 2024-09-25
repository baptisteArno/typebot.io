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

type Props = {
  url: string;
};

export const MagicLinkEmail = ({ url }: Props) => (
  <Mjml>
    <Head />
    <MjmlBody width={600}>
      <MjmlSection padding="0">
        <MjmlColumn>
          <HeroImage
            src={`${env.NEXTAUTH_URL}/images/yourMagicLinkBanner.png`}
          />
        </MjmlColumn>
      </MjmlSection>
      <MjmlSection padding="0 24px" cssClass="smooth">
        <MjmlColumn>
          <Text>Here is your magic link 👇</Text>
          <MjmlSpacer />
          <Button link={url} align="center">
            Click here to sign in
          </Button>
          <Text>
            If you didn&apos;t request this, please ignore this email.
          </Text>
          <Text>
            Best,
            <br />- Typebot Team.
          </Text>
        </MjmlColumn>
      </MjmlSection>
    </MjmlBody>
  </Mjml>
);

export const sendMagicLinkEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, "to"> & ComponentProps<typeof MagicLinkEmail>) =>
  sendEmail({
    to,
    subject: "Sign in to Typebot",
    html: render(<MagicLinkEmail {...props} />).html,
  });
