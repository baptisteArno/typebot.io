import React from 'react'

export const ErrorPage = ({ error }: { error: 'offline' | '500' | 'IE' }) => {
  let errorLabel =
    'An error occured. Please try to refresh or contact the owner of this bot.'
  if (error === 'offline') {
    errorLabel =
      'Looks like your device is offline. Please, try to refresh the page.'
  }
  if (error === 'IE') {
    errorLabel = "This bot isn't compatible with Internet Explorer."
  }
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
      {error === '500' && (
        <h1 style={{ fontWeight: 'bold', fontSize: '30px' }}>500</h1>
      )}
      <h2>{errorLabel}</h2>
    </div>
  )
}
