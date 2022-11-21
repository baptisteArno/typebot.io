import React, { ReactElement } from 'react'
import {
  MjmlHead,
  MjmlFont,
  MjmlAttributes,
  MjmlAll,
  MjmlStyle,
  MjmlRaw,
} from '@faire/mjml-react'
import { black, grayDark } from '../theme'

type HeadProps = { children?: ReactElement }

export const Head = ({ children }: HeadProps) => (
  <MjmlHead>
    <>
      <MjmlRaw>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light" />
      </MjmlRaw>
      <MjmlFont
        name="Inter"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700"
      />
      <MjmlStyle>{`
        strong {
          font-weight: 700;
        }
        .smooth {
          -webkit-font-smoothing: antialiased;
        }
        .paragraph a {
          color: ${black} !important;
        }
        .li {
          text-indent: -18px;
          margin-left: 24px;
          display: inline-block;
        }
        .footer a {
          text-decoration: none !important;
          color: ${grayDark} !important;
        }
        .dark-mode {
          display: none;
        }
        @media (min-width:480px) {
          td.hero {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
        }
        @media (prefers-color-scheme: dark) {
          body {
            background: ${black};
          }
          .logo > * {
            filter: invert(1) !important;
          }
          .paragraph > *, .paragraph a, .li > div {
            color: #fff !important;
          }
          .dark-mode {
            display: inherit;
          }
          .light-mode {
            display: none;
          }
        }
      `}</MjmlStyle>
      <MjmlAttributes>
        <MjmlAll
          font-family='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
            Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
          font-weight="400"
        />
      </MjmlAttributes>
      {children}
    </>
  </MjmlHead>
)
