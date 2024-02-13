import { env } from '@typebot.io/env'

export const NotFoundPage = () => (
  <div
    style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    }}
  >
    <h1 style={{ fontWeight: 'bold', fontSize: '30px' }}>
      {env.NEXT_PUBLIC_VIEWER_404_TITLE}
    </h1>
    <h2>{env.NEXT_PUBLIC_VIEWER_404_SUBTITLE}</h2>
  </div>
)
