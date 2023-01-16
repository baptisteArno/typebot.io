import { Standard } from '@typebot.io/react'
import { BackgroundType, Typebot } from 'models'
import { useRouter } from 'next/router'
import { SEO } from './Seo'

export type TypebotPageV2Props = {
  url: string
  typebot: Pick<
    Typebot,
    'settings' | 'theme' | 'name' | 'isClosed' | 'isArchived' | 'publicId'
  >
}

export const TypebotPageV2 = ({ url, typebot }: TypebotPageV2Props) => {
  const { asPath, push } = useRouter()

  const background = typebot.theme.general.background

  const clearQueryParamsIfNecessary = () => {
    const hasQueryParams = asPath.includes('?')
    if (
      !hasQueryParams ||
      !(typebot.settings.general.isHideQueryParamsEnabled ?? true)
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
          background.type === BackgroundType.COLOR
            ? background.content
            : 'white',
      }}
    >
      <SEO
        url={url}
        typebotName={typebot.name}
        metadata={typebot.settings.metadata}
      />
      {typebot.publicId && (
        <Standard
          typebot={typebot.publicId}
          onInit={clearQueryParamsIfNecessary}
        />
      )}
    </div>
  )
}
