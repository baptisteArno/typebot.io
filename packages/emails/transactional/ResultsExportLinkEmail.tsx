import { Body, Container, Head, Hr, Html, Text } from "@react-email/components";
import { render } from "@react-email/render";
import type { ComponentProps } from "react";
// biome-ignore lint/correctness/noUnusedImports: Need it for tsx execution
import React from "react";
import { sendEmail } from "../helpers/sendEmail";
import { Logo } from "./components/Logo";
import { container, footerText, hr, main, paragraph } from "./styles";

interface Props {
  typebotName: string;
  fileUrl: string;
  email: string;
}

export const ResultsExportLinkEmail = ({ typebotName, fileUrl }: Props) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Logo />
          <Text style={paragraph}>
            You've requested a results export for <strong>{typebotName}</strong>
            . It was processed and is now ready.
            <br />
            <br />
            You can download it <a href={fileUrl}>here</a>.
          </Text>
          <Hr style={hr} />
          <Text style={footerText}>Typebot - Build faster, Chat smarter</Text>
        </Container>
      </Body>
    </Html>
  );
};

ResultsExportLinkEmail.PreviewProps = {
  typebotName: "My Typebot",
  fileUrl: "https://typebot.io/results.csv",
} as Props;

export default ResultsExportLinkEmail;

export const sendResultsExportLinkEmail = async (
  props: ComponentProps<typeof ResultsExportLinkEmail>,
) =>
  sendEmail({
    to: props.email,
    subject: `Your results export is ready`,
    html: await render(<ResultsExportLinkEmail {...props} />),
  });
