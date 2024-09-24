import { Mjml, MjmlBody, MjmlColumn, MjmlSection } from "@faire/mjml-react";
import { render } from "@faire/mjml-react/utils/render";
import { env } from "@typebot.io/env";
import { parseNumberWithCommas } from "@typebot.io/lib/utils";
import type { SendMailOptions } from "nodemailer";
import type { ComponentProps } from "react";
import { Head } from "../components/Head";
import { HeroImage } from "../components/HeroImage";
import { Text } from "../components/Text";
import { sendEmail } from "../sendEmail";

type AlmostReachedChatsLimitEmailProps = {
  workspaceName: string;
  usagePercent: number;
  chatsLimit: number;
};

const now = new Date();
const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const readableResetDate = firstDayOfNextMonth
  .toDateString()
  .split(" ")
  .slice(1, 4)
  .join(" ");

export const AlmostReachedChatsLimitEmail = ({
  workspaceName,
  usagePercent,
  chatsLimit,
}: AlmostReachedChatsLimitEmailProps) => {
  const readableChatsLimit = parseNumberWithCommas(chatsLimit);

  return (
    <Mjml>
      <Head />
      <MjmlBody width={600}>
        <MjmlSection padding="0">
          <MjmlColumn>
            <HeroImage
              src={`${env.NEXTAUTH_URL}/images/yourBotIsFlyingBanner.png`}
            />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection padding="0 24px" cssClass="smooth">
          <MjmlColumn>
            <Text>Your bots are chatting a lot. That&apos;s amazing. 💙</Text>
            <Text>
              Your workspace <strong>{workspaceName}</strong> has used{" "}
              {usagePercent}% of the included chats this month. Once you hit{" "}
              {readableChatsLimit} chats, you will pay as you go for additional
              chats.
            </Text>
            <Text>
              Your progress can be monitored on your workspace dashboard
              settings.
            </Text>
            <Text>
              Check out the{" "}
              <a href="https://typebot.io/pricing">pricing page</a> for
              information about the pay as you go tiers.
            </Text>
            <Text>
              As a reminder, your billing cycle ends on {readableResetDate}.
            </Text>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>
  );
};

export const sendAlmostReachedChatsLimitEmail = ({
  to,
  ...props
}: Pick<SendMailOptions, "to"> &
  ComponentProps<typeof AlmostReachedChatsLimitEmail>) =>
  sendEmail({
    to,
    subject: "You're close to your chats limit",
    html: render(<AlmostReachedChatsLimitEmail {...props} />).html,
  });
