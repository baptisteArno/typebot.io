import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Link,
  Text,
} from '@react-email/components'

const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

type Props = {
  resultsUrl: string
  answers: { [key: string]: string }
}

const DefaultSendEmailNotification = ({ resultsUrl, answers }: Props) => (
  <Html>
    <Head />
    <Body style={body}>
      <Container style={container}>
        {Object.keys(answers).map((key, index) => {
          const isEmail = emailRegex.test(answers[key])

          return (
            <Text key={key} style={index === 0 ? firstEntry : entry}>
              <strong>{key}</strong>:{' '}
              {isEmail ? (
                <Link href={`mailto:${answers[key]}`}>{answers[key]}</Link>
              ) : answers[key].includes('\n') ? (
                answers[key].split('\n').map((line) => (
                  <>
                    {line}
                    <br />
                  </>
                ))
              ) : (
                answers[key]
              )}
            </Text>
          )
        })}
        <Button style={goToResultsButton} href={resultsUrl}>
          Go to results
        </Button>
      </Container>
    </Body>
  </Html>
)

const body = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px 30px',
  border: '1px solid #eaeaea',
}

const goToResultsButton = {
  backgroundColor: '#0042DA',
  padding: '10px 24px',
  borderRadius: '6px',
  color: 'white',
}

const firstEntry = {
  margin: '0 0 24x 0',
}

const entry = {
  margin: '24px 0',
}

DefaultSendEmailNotification.PreviewProps = {
  resultsUrl: 'http://localhost:3000',
  answers: {
    Name: 'John Doe',
    Email: 'baptiste@typebot.io',
    'Additional information': 'I have a question about your product.',
  },
} satisfies Props

export default DefaultSendEmailNotification
