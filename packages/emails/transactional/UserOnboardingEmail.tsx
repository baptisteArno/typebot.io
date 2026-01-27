import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import type { ComponentProps } from "react";
// biome-ignore lint/correctness/noUnusedImports: Need it for tsx execution
import React from "react";
import { bodyText, container, footerText, main } from "./styles";

interface Props {
  unsubscribeUrl?: string;
}

export const UserOnboardingEmail = ({ unsubscribeUrl }: Props) => (
  <Html>
    <Head />
    <Preview>Welcome to Typebot!</Preview>
    <Body style={main}>
      <Container
        align="left"
        style={{
          ...container,
          margin: "0",
          maxWidth: "100%",
          textAlign: "left",
        }}
      >
        <Text style={bodyText}>
          Hi,
          <br />
          <br />
          Thanks for trying out Typebot! I&apos;m Baptiste, the founder. 🙌
          <br />
          <br />
          I&apos;ve created Typebot because I think it should be easy to create
          beautiful and engaging chat experiences.
          <br />
          <br />
          Typebot has been designed to give you all the freedom you need to
          create the perfect bots for your business while still being super easy
          to use.
          <br />
          <br />
          Watch this quick 5-minute overview video to get started:
          <br />
          <Link href="https://www.youtube.com/watch?v=jp3ggg_42-M">
            https://www.youtube.com/watch?v=jp3ggg_42-M
          </Link>
          <br />
          <br />
          Join our community on Discord to connect with others and get instant
          help:
          <br />
          <Link href="https://typebot.io/discord">
            https://typebot.io/discord
          </Link>
          <br />
          <br />
          See you soon!
          <br />
          <br />
          Baptiste.
        </Text>
        <Hr />
        {unsubscribeUrl ? (
          <Text style={{ ...footerText, marginTop: "24px" }}>
            <Link href={unsubscribeUrl}>Click here to unsubscribe</Link>
          </Text>
        ) : null}
      </Container>
    </Body>
  </Html>
);

UserOnboardingEmail.PreviewProps = {
  unsubscribeUrl: "https://typebot.io/emails/unsubscribe",
} satisfies Props;

export default UserOnboardingEmail;

export const renderUserOnboardingEmail = async (
  props: ComponentProps<typeof UserOnboardingEmail>,
) => render(<UserOnboardingEmail {...props} />);
