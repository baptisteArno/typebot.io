import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Text,
  Hr,
  Heading,
  Section,
} from '@react-email/components'
import * as React from 'react'
import { env } from '@typebot.io/env'
import {
  main,
  container,
  text,
  featureSection,
  heading,
  image,
  hr,
  footer,
  link,
} from './styles'

type Props = {
  firstName?: string
}

const imagesBaseUrl = `${env.NEXTAUTH_URL}/images/emails/V2dot24Update`

export const V2dot24Update = ({}: Props) => (
  <Html>
    <Head />
    <Preview>Unveiling Typebot's Latest Innovations - v2.24 Update! 🌟</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${env.NEXTAUTH_URL}/images/logo.png`}
          width="32"
          height="32"
          alt="Typebot's Logo"
          style={{
            margin: '24px 0',
          }}
        />
        <Text style={text}>
          Hey, <br />
          <br />
          Typebot v2.24 was just released. This update introduces powerful new
          blocks and improved tool stability.
          <br />
          <br />
          Let's dive into what's new!
        </Text>

        <Section style={featureSection}>
          <Heading style={heading}>2 New AI completion blocks</Heading>
          <Text style={text}>
            Boost your chatbots with AI-powered responses using the new
            Anthropic and OpenRouter blocks.
            <br />
            <br />
            With OpenRouter, you can query literaly any AI model you want at the
            best price
            <br />
            <br />
            With Anthropic, you can generate responses with the latest
            groundbreaking Claude AI models.
          </Text>
          <Img
            src={`${imagesBaseUrl}/aiBlocks.jpg`}
            alt="New AI blocks"
            style={image}
          />
        </Section>

        <Section style={featureSection}>
          <Heading style={heading}>
            Persist chat state between sessions.
          </Heading>
          <Text style={text}>
            Now, if you enable the "Remember user" option, if the user comes
            back to the typebot, it will display the previous chat state.
            <br />
            <br />
            It also works magically when your bot is embedded 🔥
          </Text>
          <Img
            src={`${imagesBaseUrl}/saveChatState.gif`}
            alt="Persist chat state demonstration"
            style={image}
          />
        </Section>

        <Section style={featureSection}>
          <Heading style={heading}>
            Turn Into Option for AI Generation Blocks
          </Heading>
          <Text style={text}>
            Easily switch between different AI services with the new "Turn into"
            option on AI generation blocks. This convenient feature allows you
            to experiment with various AI models and choose the best fit for
            your chatbot.
          </Text>
          <Img
            src={`${imagesBaseUrl}/turnInto.gif`}
            alt="Turn into option demonstration"
            style={image}
          />
        </Section>

        <Section style={featureSection}>
          <Heading style={heading}>
            Bug Fixes and Reliability Improvements
          </Heading>
          <Text style={text}>
            We all hate bugs, right? Well, this month I've decided to fixing
            literaly all of the known issues and reported bugs to make Typebot
            more reliable.
            <br />
            <br />
            And from now on I've decided to always focus fixing newly reported
            bugs. That's that kind of standard I want to set for Typebot.
            <br />
            <br />
            Check out the full changelog{' '}
            <Link href="https://github.com/baptisteArno/typebot.io/releases/tag/v2.24.0">
              here
            </Link>
            !
          </Text>
        </Section>

        <Hr style={hr} />

        <Text style={{ ...text, marginBottom: '60px' }}>
          As always, your feedback is invaluable, so please don't hesitate to
          share your thoughts.
          <br />
          <br />
          Baptiste.
        </Text>
        <Img
          src={`${env.NEXTAUTH_URL}/images/logo.png`}
          width="32"
          height="32"
          alt="Typebot's Logo"
          style={{
            marginTop: '24px',
          }}
        />

        <Text style={footer}>Typebot.io - Powering Conversations at Scale</Text>
        <Link
          href="{{unsubscribe}}"
          target="_blank"
          style={{ ...link, color: '#898989', fontSize: '12px' }}
        >
          Unsubscribe
        </Link>
      </Container>
    </Body>
  </Html>
)

V2dot24Update.PreviewProps = {
  firstName: 'John',
}

export default V2dot24Update
