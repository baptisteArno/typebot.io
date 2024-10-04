import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import { env } from "@typebot.io/env";
import type { SendMailOptions } from "nodemailer";
import type { ComponentProps } from "react";
import { sendEmail } from "../helpers/sendEmail";

interface Props {
  url: string;
  code: string;
}

export const LoginCodeEmail = ({ url, code }: Props) => (
  <Html>
    <Head />
    <Preview>Your login code for Typebot</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${env.NEXTAUTH_URL}/images/logo.png`}
          width="32"
          height="32"
          alt="Typebot's Logo"
          style={{
            margin: "24px 0",
          }}
        />
        <Heading style={heading}>Your login code for Typebot</Heading>
        <Section style={buttonContainer}>
          <Button style={button} href={url}>
            Login to Typebot
          </Button>
        </Section>
        <Text style={paragraph}>
          This link and code will only be valid for the next 5 minutes. If the
          link does not work, you can use the login verification code directly:
        </Text>
        <code style={codeStyle}>{code}</code>
        <Hr style={hr} />
        <Link href="https://typebot.io" style={reportLink}>
          Typebot
        </Link>
      </Container>
    </Body>
  </Html>
);

LoginCodeEmail.PreviewProps = {
  url: "https://typebot.io",
  code: "654778",
} as Props;

export default LoginCodeEmail;

const logo = {
  borderRadius: 21,
  width: 42,
  height: 42,
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 0 0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};

const buttonContainer = {
  padding: "27px 0 27px",
};

const button = {
  backgroundColor: "#0042DA",
  borderRadius: "3px",
  fontWeight: "600",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "11px 23px",
};

const reportLink = {
  fontSize: "14px",
  color: "#b4becc",
};

const hr = {
  borderColor: "#dfe1e4",
  margin: "42px 0 26px",
};

const codeStyle = {
  fontFamily: "monospace",
  fontWeight: "700",
  padding: "1px 4px",
  backgroundColor: "#dfe1e4",
  letterSpacing: "-0.3px",
  fontSize: "21px",
  borderRadius: "4px",
  color: "#3c4149",
};

export const sendLoginCodeEmail = async ({
  to,
  ...props
}: Pick<SendMailOptions, "to"> & ComponentProps<typeof LoginCodeEmail>) =>
  sendEmail({
    to,
    subject: "Sign in to Typebot",
    html: await render(<LoginCodeEmail {...props} />),
  });
