import React from 'react'

export const ErrorPage = ({ error }: { error: Error }) => {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <h1 style={{ fontWeight: 'bold', fontSize: '30px' }}>{error.name}</h1>
      <h2>{error.message}</h2>
    </div>
  )
}
