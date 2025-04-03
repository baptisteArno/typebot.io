import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import { env } from "@typebot.io/env";
import { container, footer, link, logo, main } from "../styles";

type Props = {
  children: React.ReactNode;
  preview: string;
};
export const NewsletterLayout = ({ preview, children }: Props) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${env.NEXTAUTH_URL}/images/logo.png`}
          width="32"
          height="32"
          alt="Typebot's Logo"
          style={logo}
        />
        {children}
        <Img
          src={`${env.NEXTAUTH_URL}/images/logo.png`}
          width="32"
          height="32"
          alt="Typebot's Logo"
          style={logo}
        />

        <Text style={footer}>Typebot.io - Build Faster, Chat Smarter</Text>
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
