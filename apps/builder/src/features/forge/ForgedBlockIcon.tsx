import { useColorMode } from '@chakra-ui/react'
import { ForgedBlock } from '@typebot.io/forge-schemas'
import { useForgedBlock } from './hooks/useForgedBlock'

export const ForgedBlockIcon = ({
  type,
  mt,
}: {
  type: ForgedBlock['type']
  mt?: string
}): JSX.Element => {
  const { colorMode } = useColorMode()
  const { blockDef } = useForgedBlock(type)
  if (!blockDef) return <></>
  if (colorMode === 'dark' && blockDef.DarkLogo)
    return <blockDef.DarkLogo width="1rem" style={{ marginTop: mt }} />
  return <blockDef.LightLogo width="1rem" style={{ marginTop: mt }} />
}
