import { Standard } from '@typebot.io/react'
import { BackgroundType, Typebot } from '@typebot.io/schemas'
import { useRouter } from 'next/router'
import { SEO } from './Seo'

export type TypebotPageProps = {
  url: string
  typebot?: Pick<Typebot, 'settings' | 'theme' | 'name' | 'publicId'>
}

export const TypebotPageV3 = ({ url, typebot }: TypebotPageProps) => {
  const { asPath, push, query } = useRouter()

  const background = typebot?.theme.general.background

  const clearQueryParamsIfNecessary = () => {
    const hasQueryParams = asPath.includes('?')
    if (
      !hasQueryParams ||
      !(typebot?.settings.general.isHideQueryParamsEnabled ?? true)
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
      {typebot && (
        <SEO
          url={url}
          typebotName={typebot.name}
          metadata={typebot.settings.metadata}
        />
      )}
      <Standard
        typebot={typebot?.publicId ?? query.publicId?.toString() ?? 'n'}
        onInit={clearQueryParamsIfNecessary}
      />
    </div>
  )
}
