import { Standard } from '@typebot.io/nextjs'
import { useRouter } from 'next/router'
import { SEO } from './Seo'
import { Typebot } from '@typebot.io/schemas/features/typebot/typebot'
import { BackgroundType } from '@typebot.io/schemas/features/typebot/theme/constants'
import { defaultSettings } from '@typebot.io/schemas/features/typebot/settings/constants'
import { Font } from '@typebot.io/schemas'
import { useMemo } from 'react'

export type TypebotV3PageProps = {
  url: string
  isMatchingViewerUrl?: boolean
  name: string
  publicId: string | null
  font: Font | null
  isHideQueryParamsEnabled: boolean | null
  background: NonNullable<Typebot['theme']['general']>['background']
  metadata: Typebot['settings']['metadata']
}

export const TypebotPageV3 = ({
  font,
  isMatchingViewerUrl,
  publicId,
  name,
  url,
  isHideQueryParamsEnabled,
  metadata,
  background,
}: TypebotV3PageProps) => {
  const { asPath, push } = useRouter()

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

  const apiOrigin = useMemo(() => {
    if (isMatchingViewerUrl) return
    return new URL(url).origin
  }, [isMatchingViewerUrl, url])

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
      <Standard
        typebot={publicId}
        onInit={clearQueryParamsIfNecessary}
        font={font ?? undefined}
        apiHost={apiOrigin}
      />
    </div>
  )
}
