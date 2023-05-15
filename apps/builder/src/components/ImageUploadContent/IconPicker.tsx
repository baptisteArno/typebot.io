import {
  Button,
  Stack,
  Image,
  HStack,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { iconNames } from './iconNames'
import { TextInput } from '../inputs'
import { ColorPicker } from '../ColorPicker'

const batchSize = 200

type Props = {
  onIconSelected: (url: string) => void
}

export const IconPicker = ({ onIconSelected }: Props) => {
  const initialIconColor = useColorModeValue('#222222', '#ffffff')
  const scrollContainer = useRef<HTMLDivElement>(null)
  const bottomElement = useRef<HTMLDivElement>(null)
  const [displayedIconNames, setDisplayedIconNames] = useState(
    iconNames.slice(0, batchSize)
  )
  const searchQuery = useRef<string>('')
  const [selectedColor, setSelectedColor] = useState(initialIconColor)
  const isWhite = useMemo(
    () =>
      selectedColor.toLowerCase() === '#ffffff' ||
      selectedColor.toLowerCase() === '#fff' ||
      selectedColor === 'white',
    [selectedColor]
  )

  useEffect(() => {
    if (!bottomElement.current) return
    const observer = new IntersectionObserver(handleObserver, {
      root: scrollContainer.current,
      rootMargin: '200px',
    })
    if (bottomElement.current) observer.observe(bottomElement.current)
    return () => {
      observer.disconnect()
    }
  }, [])

  const handleObserver = (entities: IntersectionObserverEntry[]) => {
    const target = entities[0]
    if (target.isIntersecting && searchQuery.current.length <= 2)
      setDisplayedIconNames((displayedIconNames) => [
        ...displayedIconNames,
        ...iconNames.slice(
          displayedIconNames.length,
          displayedIconNames.length + batchSize
        ),
      ])
  }

  const searchIcon = async (query: string) => {
    searchQuery.current = query
    if (query.length <= 2)
      return setDisplayedIconNames(iconNames.slice(0, batchSize))
    const filteredIconNames = iconNames.filter((iconName) =>
      iconName.toLowerCase().includes(query.toLowerCase())
    )
    setDisplayedIconNames(filteredIconNames)
  }

  const updateColor = (color: string) => {
    if (!color.startsWith('#')) return
    setSelectedColor(color)
  }

  const selectIcon = async (iconName: string) => {
    const svg = await (await fetch(`/icons/${iconName}.svg`)).text()
    const dataUri = `data:image/svg+xml;utf8,${svg
      .replace('<svg', `<svg fill='${encodeURIComponent(selectedColor)}'`)
      .replace(/"/g, "'")}`
    onIconSelected(dataUri)
  }

  return (
    <Stack>
      <HStack>
        <TextInput
          placeholder="Search..."
          onChange={searchIcon}
          withVariableButton={false}
        />
        <ColorPicker defaultValue={selectedColor} onColorChange={updateColor} />
      </HStack>

      <SimpleGrid
        spacing={0}
        minChildWidth="38px"
        overflowY="scroll"
        maxH="350px"
        ref={scrollContainer}
        overflow="scroll"
      >
        {displayedIconNames.map((iconName) => (
          <Button
            size="sm"
            variant={isWhite ? 'solid' : 'ghost'}
            colorScheme={isWhite ? 'blackAlpha' : undefined}
            fontSize="xl"
            w="38px"
            h="38px"
            p="2"
            key={iconName}
            onClick={() => selectIcon(iconName)}
          >
            <Icon name={iconName} color={selectedColor} />
          </Button>
        ))}
        <div ref={bottomElement} />
      </SimpleGrid>
    </Stack>
  )
}

const Icon = ({ name, color }: { name: string; color: string }) => {
  const [svg, setSvg] = useState('')

  const dataUri = useMemo(
    () =>
      `data:image/svg+xml;utf8,${svg.replace(
        '<svg',
        `<svg fill='${encodeURIComponent(color)}'`
      )}`,
    [svg, color]
  )

  useEffect(() => {
    fetch(`/icons/${name}.svg`)
      .then((response) => response.text())
      .then((text) => setSvg(text))
  }, [name])

  if (!svg) return null

  return <Image src={dataUri} alt={name} w="full" h="full" />
}
