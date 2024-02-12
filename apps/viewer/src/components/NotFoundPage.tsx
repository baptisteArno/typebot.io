import { env } from '@typebot.io/env'

export const NotFoundPage = () => (
  <div
    style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      // backgroundColor: '#add8e6',
    }}
  >
    <h1 style={{ fontWeight: 'bold', fontSize: '30px' }}>404</h1>
    <h2>The bot you&apos;re looking for doesn&apos;t exist</h2>
    <a
      href="https://app.flowdacity.com"
      target="_blank"
      style={{
        color: 'white',
        textDecoration: 'none',
        padding: '10px',
        border: '1px solid black',
        borderRadius: '8px',
        backgroundColor: 'blue',
      }}
    >
      Create your chatbot
    </a>
    <h1 style={{ fontWeight: 'bold', fontSize: '30px' }}>
      {env.NEXT_PUBLIC_VIEWER_404_TITLE}
    </h1>
    <h2>{env.NEXT_PUBLIC_VIEWER_404_SUBTITLE}</h2>
  </div>
)
