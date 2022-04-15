// Taken from https://github.com/plausible/docs/blob/master/src/js/api-helpers.js 💙
import React from 'react'
import { useColorMode } from '@docusaurus/theme-common'

export const Required = () => (
  <span
    style={{
      color: '#ff8e20',
      fontSize: '0.7rem',
      fontWeight: 'bold',
      position: 'relative',
      bottom: '4px',
    }}
  >
    REQUIRED
  </span>
)

export const Optional = () => (
  <span
    style={{
      color: '#718096',
      fontSize: '0.7rem',
      fontWeight: 'bold',
      position: 'relative',
      bottom: '4px',
    }}
  >
    optional
  </span>
)

export const Tag = ({ children, color }) => {
  const { isDarkTheme } = useColorMode()
  let backgroundColor = isDarkTheme ? '#2d60b4' : '#CBD5E0'
  switch (color) {
    case 'green':
      backgroundColor = '#68D391'
      break
    case 'orange':
      backgroundColor = '#ffa54c'
      break
  }
  return (
    <span
      style={{
        backgroundColor,
        borderRadius: '5px',
        padding: '0px 5px',
      }}
    >
      {children}
    </span>
  )
}
