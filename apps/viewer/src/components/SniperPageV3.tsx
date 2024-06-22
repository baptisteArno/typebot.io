import { Standard } from '@sniper.io/nextjs'
import { useRouter } from 'next/router'
import { SEO } from './Seo'
import { Sniper } from '@sniper.io/schemas/features/sniper/sniper'
import { BackgroundType } from '@sniper.io/schemas/features/sniper/theme/constants'
import { defaultSettings } from '@sniper.io/schemas/features/sniper/settings/constants'
import { Font } from '@sniper.io/schemas'

export type SniperV3PageProps = {
  url: string
  name: string
  publicId: string | null
  font: Font | null
  isHideQueryParamsEnabled: boolean | null
  background: NonNullable<Sniper['theme']['general']>['background']
  metadata: Sniper['settings']['metadata']
}

export const SniperPageV3 = ({
  font,
  publicId,
  name,
  url,
  isHideQueryParamsEnabled,
  metadata,
  background,
}: SniperV3PageProps) => {
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
      <SEO url={url} sniperName={name} metadata={metadata} />
      <Standard
        sniper={publicId}
        onInit={clearQueryParamsIfNecessary}
        font={font ?? undefined}
      />
    </div>
  )
}
