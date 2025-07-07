import {
  Box,
  Center,
  Collapse,
  HStack,
  SimpleGrid,
  Text,
  useColorModeValue as mode,
} from '@chakra-ui/react'
import { ChevronRightIcon } from 'assets/icons/ChevronRightIcon'
import Link from 'next/link'
import * as React from 'react'
import { links } from './_data'

type Props = { isOpen: boolean }

export const ResourcesMenu = ({ isOpen }: Props) => (
  <Collapse in={isOpen} animateOpacity unmountOnExit={false}>
    <Box
      w="full"
      shadow="lg"
      pos="absolute"
      insetX={0}
      top="16"
      py="12"
      px="4"
      bgGradient="linear(to-b, gray.900, gray.800)"
    >
      <Box maxW="7xl" mx="auto" px="8">
        <SimpleGrid spacing="10" columns={2}>
          {links[0].children?.map((item, idx) => (
            <Box
              as={Link}
              key={idx}
              className="group"
              href={item.href}
              m="-3"
              p="3"
              display="flex"
              alignItems="flex-start"
              transition="all 0.2s"
              rounded="lg"
              _hover={{ bg: mode('gray.50', 'gray.600') }}
              _focus={{ shadow: 'outline' }}
              target={
                item.href.startsWith('https') &&
                !item.href.includes('app.typebot.io')
                  ? '_blank'
                  : undefined
              }
            >
              <Center
                aria-hidden
                as="span"
                flexShrink={0}
                w="10"
                h="10"
                fontSize="3xl"
                color={'orange.300'}
              >
                {item.icon}
              </Center>
              <Box marginStart="3" as="dl">
                <HStack as="dt">
                  <Text
                    fontWeight="semibold"
                    color={mode('gray.900', 'white')}
                    _groupHover={{ color: mode('orange.600', 'inherit') }}
                  >
                    {item.label}
                  </Text>
                  <Box
                    fontSize="xs"
                    as={ChevronRightIcon}
                    transition="all 0.2s"
                    _groupHover={{
                      color: mode('orange.600', 'inherit'),
                      transform: 'translateX(2px)',
                    }}
                  />
                </HStack>
                <Text as="dd" color={mode('gray.500', 'gray.400')}>
                  {item.description}
                </Text>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  </Collapse>
)
