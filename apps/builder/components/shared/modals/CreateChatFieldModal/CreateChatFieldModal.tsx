import {
  Heading,
  Modal,
  ModalBody,
  Text,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  ModalOverlay,
  Stack,
  ListItem,
  UnorderedList,
  ListIcon,
  chakra,
  Tooltip,
  ListProps,
  Select,
  SelectProps,
  Button,
  HStack,
  FormLabel,
  Input,
  FormControl,
  Textarea,
} from '@chakra-ui/react'

type CreateChatFieldModalProps = {
  isOpen: boolean
  onClose: () => void
}

export const CreateChatFieldModal = ({
  onClose,
  isOpen,
}: CreateChatFieldModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Novo campo de conversas</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack}>
          <Stack as="form">
            <FormControl isRequired>
              <FormLabel>Tipo de campo</FormLabel>
              <TypeFieldSelect placeholder="Selecione o tipo do campo..." />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Título do campo</FormLabel>
              <Input
                // defaultValue={config.from.name ?? ''}
                // onChange={handleFromNameChange}
                placeholder="Insira o título do campo..."
                // withVariableButton={false}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Código do campo</FormLabel>
              <Input
                // defaultValue={config.from.name ?? ''}
                // onChange={handleFromNameChange}
                placeholder="Código do campo..."
                // withVariableButton={false}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Texto de dica do campo</FormLabel>
              <Input
                // defaultValue={config.from.name ?? ''}
                // onChange={handleFromNameChange}
                placeholder="Insira o texto de dica do campo..."
                // withVariableButton={false}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Texto de ajuda do campo</FormLabel>
              <Textarea placeholder="Texto de ajuda do campo" />
            </FormControl>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <HStack>
            <Button colorScheme="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              //   onClick={handlePayClick}
              //   isLoading={payLoading}
              colorScheme="blue"
            >
              Salvar
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

const TypeFieldSelect = (props: SelectProps) => {
  const options = [
    { value: '', label: 'Selecione uma opção' },
    { value: 'text', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'date', label: 'Data' },
  ]

  return (
    <Select {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  )
}
