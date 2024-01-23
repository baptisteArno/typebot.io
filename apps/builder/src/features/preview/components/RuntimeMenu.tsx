import { ChevronDownIcon } from '@/components/icons'
import {
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  Tag,
  HStack,
  Text,
} from '@chakra-ui/react'
import { runtimes } from '../data'

type Runtime = (typeof runtimes)[number]

type Props = {
  selectedRuntime: Runtime
  onSelectRuntime: (runtime: Runtime) => void
}

export const RuntimeMenu = ({ selectedRuntime, onSelectRuntime }: Props) => {
  return (
    <Menu>
      <MenuButton
        as={Button}
        leftIcon={selectedRuntime.icon}
        rightIcon={<ChevronDownIcon />}
      >
        <HStack justifyContent="space-between">
          <Text>{selectedRuntime.name}</Text>
          {'status' in selectedRuntime &&
          typeof selectedRuntime.status === 'string' ? (
            <Tag colorScheme="orange">{selectedRuntime.status}</Tag>
          ) : null}
        </HStack>
      </MenuButton>
      <MenuList w="100px">
        {runtimes
          .filter((runtime) => runtime.name !== selectedRuntime.name)
          .map((runtime) => (
            <MenuItem
              key={runtime.name}
              icon={runtime.icon}
              onClick={() => onSelectRuntime(runtime)}
            >
              <HStack justifyContent="space-between">
                <Text>{runtime.name}</Text>
                {'status' in runtime && typeof runtime.status === 'string' ? (
                  <Tag colorScheme="orange">{runtime.status}</Tag>
                ) : null}
              </HStack>
            </MenuItem>
          ))}
      </MenuList>
    </Menu>
  )
}
