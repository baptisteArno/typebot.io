import {
  Mjml,
  MjmlBody,
  MjmlColumn,
  MjmlSection,
  MjmlSpacer,
} from "@faire/mjml-react";
import { render } from "@faire/mjml-react/utils/render";
import { env } from "@typebot.io/env";
import { parseNumberWithCommas } from "@typebot.io/lib/utils";
import type { SendMailOptions } from "nodemailer";
import type { ComponentProps } from "react";
import { Button } from "../components/Button";
import { Head } from "../components/Head";
import { HeroImage } from "../components/HeroImage";
import { Text } from "../components/Text";
import { sendEmail } from "../sendEmail";

type ReachedChatsLimitEmailProps = {
  chatsLimit: number;
  url: string;
};

export const ReachedChatsLimitEmail = ({
  chatsLimit,
  url,
}: ReachedChatsLimitEmailProps) => {
  const readableChatsLimit = parseNumberWithCommas(chatsLimit);

  return (
    <Mjml>
      <Head />
      <MjmlBody width={600}>
        <MjmlSection padding="0">
          <MjmlColumn>
            <HeroImage
              src={`${env.NEXTAUTH_URL}/images/actionRequiredBanner.png`}
            />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection padding="0 24px" cssClass="smooth">
          <MjmlColumn>
            <Text>
              It just happened, you&apos;ve reached your monthly{" "}
              {readableChatsLimit} chats limit 😮
            </Text>
            <Text>
              If you&apos;d like your bots to continue chatting with your users
              this month, then you need to upgrade your plan. 🚀
            </Text>

            <MjmlSpacer height="24px" />
            <Button link={url}>Upgrade workspace</Button>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
};

export const sendReachedChatsLimitEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, "to"> &
  ComponentProps<typeof ReachedChatsLimitEmail>) =>
  sendEmail({
    to,
    subject: "You've reached your chats limit",
    html: render(<ReachedChatsLimitEmail {...props} />).html,
  });
