import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Img,
  Link,
  Text,
} from '@react-email/components'
import { main, container, footer, link } from '../styles'
import { env } from '@typebot.io/env'

type Props = {
  children: React.ReactNode
  preview: string
}
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
          style={{
            margin: '24px 0',
          }}
        />
        {children}
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
