import {
  Button,
  Stack,
  Image,
  HStack,
  useColorModeValue,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { iconNames } from './iconNames'
import { TextInput } from '../inputs'
import { ColorPicker } from '../ColorPicker'
import { useTranslate } from '@tolgee/react'

const batchSize = 200

type Props = {
  onIconSelected: (url: string) => void
}

const localStorageRecentIconNamesKey = 'recentIconNames'
const localStorageDefaultIconColorKey = 'defaultIconColor'

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
      initialIconColor === '#222222' &&
      (selectedColor.toLowerCase() === '#ffffff' ||
        selectedColor.toLowerCase() === '#fff' ||
        selectedColor === 'white'),
    [initialIconColor, selectedColor]
  )
  const [recentIconNames, setRecentIconNames] = useState([])
  const { t } = useTranslate()

  useEffect(() => {
    const recentIconNames = localStorage.getItem(localStorageRecentIconNamesKey)
    const defaultIconColor = localStorage.getItem(
      localStorageDefaultIconColorKey
    )
    if (recentIconNames) setRecentIconNames(JSON.parse(recentIconNames))
    if (defaultIconColor) setSelectedColor(defaultIconColor)
  }, [])

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
    localStorage.setItem(localStorageDefaultIconColorKey, color)
    setSelectedColor(color)
  }

  const selectIcon = async (iconName: string) => {
    localStorage.setItem(
      localStorageRecentIconNamesKey,
      JSON.stringify([...new Set([iconName, ...recentIconNames].slice(0, 30))])
    )
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
          placeholder={t('emojiList.searchInput.placeholder')}
          onChange={searchIcon}
          withVariableButton={false}
          debounceTimeout={300}
        />
        <ColorPicker value={selectedColor} onColorChange={updateColor} />
      </HStack>

      <Stack overflowY="auto" maxH="350px" ref={scrollContainer} spacing={4}>
        {recentIconNames.length > 0 && (
          <Stack>
            <Text fontSize="xs" color="gray.400" fontWeight="semibold" pl="2">
              RECENT
            </Text>
            <SimpleGrid
              spacing={0}
              gridTemplateColumns={`repeat(auto-fill, minmax(38px, 1fr))`}
              bgColor={isWhite ? 'gray.400' : undefined}
              rounded="md"
            >
              {recentIconNames.map((iconName) => (
                <Button
                  size="sm"
                  variant={'ghost'}
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
            </SimpleGrid>
          </Stack>
        )}
        <Stack>
          {recentIconNames.length > 0 && (
            <Text fontSize="xs" color="gray.400" fontWeight="semibold" pl="2">
              ICONS
            </Text>
          )}
          <SimpleGrid
            spacing={0}
            gridTemplateColumns={`repeat(auto-fill, minmax(38px, 1fr))`}
            bgColor={isWhite ? 'gray.400' : undefined}
            rounded="md"
          >
            {displayedIconNames.map((iconName) => (
              <Button
                size="sm"
                variant={'ghost'}
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
          </SimpleGrid>
        </Stack>

        <div ref={bottomElement} />
      </Stack>
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
