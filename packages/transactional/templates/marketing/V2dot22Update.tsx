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
  link,
  featureSection,
  heading,
  image,
  hr,
  footer,
} from './styles'

type Props = {
  firstName?: string
}

const imagesBaseUrl = `${env.NEXTAUTH_URL}/images/emails/V2dot22Update`

export const V2dot22Update = ({}: Props) => (
  <Html>
    <Head />
    <Preview>January hottest new features on Typebot 🔥</Preview>
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
          Hi, <br />
          <br />
          We started 2024 on fire. What a productive month! Some of it has been
          possible thanks to the new in-house framework to build new blocks:{' '}
          <Link
            href="https://docs.typebot.io/contribute/guides/create-block"
            target="_blank"
            style={{ ...link }}
          >
            The Forge
          </Link>
          <br />
          <br />
          So I want to thank all new contributors for their work this month. 🙏
        </Text>
        <Button
          href="https://app.typebot.io"
          style={{
            backgroundColor: '#0042DA',
            padding: '10px 16px',
            borderRadius: '4px',
            color: 'white',
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
            fontSize: '15px',
            fontWeight: 'bold',
            margin: '20px 0',
          }}
        >
          Try the new features
        </Button>

        <Section style={featureSection}>
          <Heading style={heading}>New graph gestures</Heading>
          <Text style={text}>
            At last! You can select multiple groups, move them together, and
            duplicate them, accross all typebots.
          </Text>
          <Img
            src={`${imagesBaseUrl}/groupSelection.gif`}
            alt="Group selection demo"
            style={image}
          />
        </Section>

        <Section style={featureSection}>
          <Heading style={heading}>3 new blocks in town</Heading>
          <Text style={text}>
            We've added 3 new blocks to the library:
            <br />
            <br />
            <span style={{ fontWeight: 'bold' }}>QR Code</span>: generate a QR
            code image URL on the fly to use in your chat. Super useful for
            typebots displayed on physical devices in a store or at an event.
            <br />
            <br />
            <span style={{ fontWeight: 'bold' }}>Mistral</span>: an alternative
            to the OpenAI block. It uses the same parameters. This block allows
            you to consume Mistral AI models.
            <br />
            <br />
            <span style={{ fontWeight: 'bold' }}>Dify.AI</span>: craft your own
            AI agent on Dify and consume it directly on Typebot to have the best
            of both worlds.
          </Text>
          <Img
            src={`${imagesBaseUrl}/newblocks.jpg`}
            width="550"
            alt="3 new blocks"
            style={image}
          />
        </Section>

        <Section style={featureSection}>
          <Heading style={heading}>OpenAI block: Ask assistant</Heading>
          <Text style={text}>
            Probably the easiest way to use OpenAI's new Assistant features.
            Drag and drop a block, plug a few things and you're good to go ✨
          </Text>
          <Img
            src={`${imagesBaseUrl}/openaiAssistantGif.gif`}
            width="550"
            alt="OpenAI Assistant demo"
            style={image}
          />
        </Section>

        <Section style={featureSection}>
          <Heading style={heading}>Other notable improvements</Heading>
          <Text style={text}>
            ⏰ You can now select a time window in the Analytics graph for a
            finer analysis.
            <br />
            <br />
            ⌨️ Improved typing emulation settings. You can now set a global wait
            time between each messages.
            <br />
            <br />
            🧠 Tools / functions support in OpenAI block
            <br />
            <br />
            🔒 New "Allowed origins" typebot settings to make sure your typebot
            can only be ran from your domain.
            <br />
            <br />
            🗄️ New visibility option in the File upload block. You can now set
            your uploaded file URL as private.
            <br />
            <br />
            👨‍💻 You can now use the `setVariable` function in any custom code to
            set the value of a specific variable.
          </Text>
        </Section>

        <Hr style={hr} />

        <Text style={{ ...text, marginBottom: '60px' }}>
          Feel free to reply to this email, I read and answer all of them. ❤️
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

V2dot22Update.PreviewProps = {
  firstName: 'John',
}

export default V2dot22Update
