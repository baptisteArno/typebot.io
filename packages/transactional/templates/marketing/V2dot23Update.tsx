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
  Button,
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

const imagesBaseUrl = `${env.NEXTAUTH_URL}/images/emails/V2dot23Update`

export const V2dot23Update = ({}: Props) => (
  <Html>
    <Head />
    <Preview>Unveiling Typebot's Latest Innovations - v2.23 Update! 🌟</Preview>
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
          I'm thrilled to announce the release of Typebot v2.23, packed with
          features that enrich your chatbot experience. This update introduces
          powerful new blocks and enhanced customizability.
          <br />
          <br />
          Let's dive into what's new!
        </Text>

        <Section style={featureSection}>
          <Heading style={heading}>ElevenLabs Block - Text to Speech</Heading>
          <Text style={text}>
            Elevate your chatbots with life-like voice outputs. The ElevenLabs
            block simplifies converting text to realistic voices, making your
            bots more interactive and engaging.
          </Text>
          <Img
            src={`${imagesBaseUrl}/elevenlabs.gif`}
            alt="ElevenLabs Block demo"
            style={image}
          />
        </Section>

        <Section style={featureSection}>
          <Heading style={heading}>Custom Fonts</Heading>
          <Text style={text}>
            Personalize your bots even further by defining your own custom
            fonts. This new feature allows you to match your chatbot's
            typography with your brand identity seamlessly.
          </Text>
        </Section>

        <Section style={featureSection}>
          <Heading style={heading}>Progress Bar</Heading>
          <Text style={text}>
            Improve user experience with a progress bar. Now, users can easily
            track their conversation progress, enhancing engagement and
            completion rates.
          </Text>
          <Img
            src={`${imagesBaseUrl}/progressBar.gif`}
            alt="Progress Bar demonstration"
            style={image}
          />
        </Section>

        <Section style={featureSection}>
          <Heading style={heading}>Enhanced Button Inputs</Heading>
          <Text style={text}>
            Speed up your setup with the ability to paste multiple items into
            the Buttons input. Lists are automatically detected and populated,
            streamlining the creation process.
          </Text>
        </Section>

        <Section style={featureSection}>
          <Heading style={heading}>
            Advanced Time Filtering in Analytics
          </Heading>
          <Text style={text}>
            Gain deeper insights with the new time filtering options for the
            Results table and analytics view. This feature allows for more
            precise data analysis over specific time periods.
          </Text>
          <Img
            src={`${imagesBaseUrl}/timeFiltering.jpg`}
            alt="Time filtering option"
            style={image}
          />
        </Section>

        <Section style={featureSection}>
          <Heading style={heading}>Together AI Block</Heading>
          <Text style={text}>
            Explore new AI possibilities with the Together AI block. This
            addition lets you harness their OpenAI-like API for even more
            dynamic and intelligent chatbot interactions.
          </Text>
        </Section>

        <Hr style={hr} />

        <Text style={{ ...text, marginBottom: '60px' }}>
          I'm excited for you to try these new features and see how they can
          enhance your chatbot projects. As always, I'm here to support your
          journey and look forward to your feedback. 💬
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

V2dot23Update.PreviewProps = {
  firstName: 'John',
}

export default V2dot23Update
