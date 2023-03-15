import React from 'react'
import { getViewerUrl, isEmpty } from '@typebot.io/lib'

export const ErrorPage = ({ error }: { error: Error }) => {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '0 1rem',
      }}
    >
      {isEmpty(getViewerUrl()) ? (
        <>
          <h1 style={{ fontWeight: 'bold', fontSize: '30px' }}>
            NEXT_PUBLIC_VIEWER_URL is missing
          </h1>
          <h2>
            Make sure to configure the viewer properly (
            <a href="https://docs.typebot.io/self-hosting/configuration#viewer">
              https://docs.typebot.io/self-hosting/configuration#viewer
            </a>
            )
          </h2>
        </>
      ) : (
        <p style={{ fontSize: '24px', textAlign: 'center' }}>{error.message}</p>
      )}
    </div>
  )
}
