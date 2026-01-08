import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import type { ComponentProps } from "react";
// biome-ignore lint/correctness/noUnusedImports: Need it for tsx execution
import React from "react";
import { bodyText, container, main, primaryButton } from "./styles";

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

interface Props {
  resultsUrl: string;
  answers: { [key: string]: string };
}

export const DefaultBotNotificationEmail = ({ resultsUrl, answers }: Props) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {Object.keys(answers).map((key) => {
            const isEmail = EMAIL_REGEX.test(answers[key]);

            return (
              <Text key={key} style={bodyText}>
                <b>{key}</b>:{" "}
                {isEmail ? (
                  <a href={`mailto:${answers[key]}`}>{answers[key]}</a>
                ) : answers[key].includes("\n") ? (
                  answers[key].split("\n").map((line) => (
                    <>
                      {line}
                      <br />
                    </>
                  ))
                ) : (
                  answers[key]
                )}
              </Text>
            );
          })}
          <Button style={primaryButton} href={resultsUrl}>
            Go to results
          </Button>
        </Container>
      </Body>
    </Html>
  );
};

DefaultBotNotificationEmail.PreviewProps = {
  resultsUrl: "http://localhost:3000",
  answers: {
    Name: "John",
    Email: "john@gmail.com",
    Info: "Item 1, Item 2",
  },
} as Props;

export default DefaultBotNotificationEmail;

export const renderDefaultBotNotificationEmail = async (
  props: ComponentProps<typeof DefaultBotNotificationEmail>,
) => render(<DefaultBotNotificationEmail {...props} />);
