import { Standard } from '@typebot.io/nextjs'
import { useRouter } from 'next/router'
import { SEO } from './Seo'
import { Typebot } from '@typebot.io/schemas/features/typebot/typebot'
import { BackgroundType } from '@typebot.io/schemas/features/typebot/theme/constants'
import { defaultSettings } from '@typebot.io/schemas/features/typebot/settings/constants'
import { Font } from '@typebot.io/schemas'
import { useState } from 'react'

export type TypebotV3PageProps = {
  url: string
  name: string
  publicId: string | null
  font: Font | null
  isHideQueryParamsEnabled: boolean | null
  background: NonNullable<Typebot['theme']['general']>['background']
  metadata: Typebot['settings']['metadata']
}

export const TypebotPageV3 = ({
  font,
  publicId,
  name,
  url,
  isHideQueryParamsEnabled,
  metadata,
  background,
}: TypebotV3PageProps) => {
  const { asPath, push } = useRouter()
  const [password, setPassword] = useState<string | undefined>(undefined)
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [isPasswordValid, setIsPasswordValid] = useState(true)

  const clearQueryParamsIfNecessary = () => {
    const hasQueryParams = asPath.includes('?')
    if (
      !hasQueryParams ||
      !(
        isHideQueryParamsEnabled ??
        defaultSettings.general.isHideQueryParamsEnabled
      )
    )
      return
    push(asPath.split('?')[0], undefined, { shallow: true })
  }

  return (
    <div
      style={{
        height: '100vh',
        // Set background color to avoid SSR flash
        backgroundColor:
          background?.type === BackgroundType.COLOR
            ? background?.content
            : background?.type === BackgroundType.NONE
            ? undefined
            : '#fff',
      }}
    >
      <SEO url={url} typebotName={name} metadata={metadata} />

      {isPasswordProtected || !isPasswordValid ? (
        <div
          style={{
            width: 'full',
            flexDirection: 'column',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <h1
            style={{
              fontSize: '1.5em',
              fontWeight: 'semibold',
              marginBottom: '2rem',
              color: '#475569',
            }}
          >
            This chat is password protected
          </h1>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              style={{
                marginRight: '1rem',
                fontSize: '1.2em',
                padding: '0.5em',
                border: '1px solid #475569',
                borderRadius: '5px',
              }}
            />
            <button
              onClick={() => {
                setIsPasswordValid(true)
                setIsPasswordProtected(false)
              }}
              style={{
                fontSize: '1.2em',
                padding: '0.5em 1em',
                borderRadius: '5px',
                backgroundColor: '#6857c1',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              Submit
            </button>
          </div>
          {!isPasswordValid && (
            <a
              style={{
                color: 'red',
                marginTop: '1rem',
              }}
            >
              Incorrect password
            </a>
          )}
        </div>
      ) : (
        <>
          <Standard
            typebot={publicId}
            font={font ?? undefined}
            password={password}
            onInit={clearQueryParamsIfNecessary}
            onPasswordProtected={() => setIsPasswordProtected(true)}
            onPasswordInvalid={() => setIsPasswordValid(false)}
          />
        </>
      )}
    </div>
  )
}
