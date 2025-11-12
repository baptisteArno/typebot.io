import Link from 'next/link'
import Head from 'next/head'

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Page not found - Typebot</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          gap: '1rem',
          padding: '2rem',
        }}
      >
        <h1 style={{ fontSize: '2.25rem', margin: 0 }}>404</h1>
        <p style={{ margin: 0 }}>This page could not be found.</p>
        <Link
          href="/"
          style={{ color: '#2563eb', textDecoration: 'underline' }}
        >
          Go back home
        </Link>
      </main>
    </>
  )
}
