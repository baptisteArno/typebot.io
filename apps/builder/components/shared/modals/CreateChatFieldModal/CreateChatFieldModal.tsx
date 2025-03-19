import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalFooter,
  ModalOverlay,
  Stack,
  Button,
  HStack,
  FormLabel,
  Input,
  FormControl,
  Textarea,
  FormErrorMessage,
  Box,
  Text,
  useToast,
} from '@chakra-ui/react'
import { Variable } from 'models'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useCallback } from 'react'
import CustomFields from 'services/octadesk/customFields/customFields'
import { CustomFieldTypes, DomainType } from 'enums/customFieldsEnum'
import { useTypebot } from 'contexts/TypebotContext'
import { ChatFieldTypeSelect } from './ChatFieldTypeSelect'

type CreateChatFieldModalProps = {
  isOpen: boolean
  onClose: () => void
  onCreateVariable: (variable: Variable) => void
}

const schema = z.object({
  type: z
    .nativeEnum(CustomFieldTypes)
    .refine(
      (val) =>
        Object.values(CustomFieldTypes).includes(val as CustomFieldTypes),
      { message: 'Selecione um tipo válido' }
    ),
  title: z
    .string()
    .min(1, { message: 'Campo obrigatório' })
    .max(30, 'O título do campo deve ter no máximo 30 caracteres.'),
  fieldId: z
    .string()
    .min(1, { message: 'Campo obrigatório' })
    .max(30, 'O código do campo deve ter no máximo 30 caracteres.')
    .regex(
      /^\w+$/,
      'O código do campo deve conter apenas letras, números e underscores.'
    ),
  placeHolder: z
    .string()
    .min(1, { message: 'Campo obrigatório' })
    .max(30, 'O texto de dica do campo deve ter no máximo 30 caracteres.'),
  hint: z
    .string()
    .min(1, { message: 'Campo obrigatório' })
    .max(240, 'O texto de ajuda do campo deve ter no máximo 240 caracteres.'),
})

export const CreateChatFieldModal = ({
  onClose,
  isOpen,
  onCreateVariable,
}: CreateChatFieldModalProps) => {
  type FormData = z.infer<typeof schema>

  const { createVariable } = useTypebot()

  const toast = useToast({
    position: 'top-right',
  })

  const {
    setValue,
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: CustomFieldTypes.Text,
      title: '',
      fieldId: '',
      placeHolder: '',
      hint: '',
    },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const { data: resData } = await CustomFields().createCustomField({
        domainType: DomainType.Chat,
        ...data,
      })

      if (resData) {
        const variable: Variable = {
          id: resData.id,
          name: resData.title,
          domain: 'CHAT',
          token: '#' + resData.fieldId,
          variableId: resData.id,
          example: '',
          fieldId: resData.fieldId,
          type: resData.type || 'string',
          fixed: true,
        }

        createVariable(variable)
        onCreateVariable(variable)
      }

      toast({
        title: 'Campo de conversa criado com sucesso.',
        status: 'success',
      })

      onClose()
    } catch (error) {
      toast({
        title: 'Ocorreu um erro ao criar o campo. Tente novamente.',
        status: 'error',
      })
    }
  }

  const replaceSpacesByUnderscore = useCallback((value: string) => {
    return value.replace(/\s+/g, '_')
  }, [])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <ModalHeader>Novo campo de conversas</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack}>
          <Stack>
            <FormControl isRequired isInvalid={!!errors.type}>
              <FormLabel>Tipo de campo</FormLabel>
              <ChatFieldTypeSelect
                placeholder="Selecione o tipo do campo..."
                onChange={(newValue: any) =>
                  setValue('type', newValue?.value || '')
                }
              />
              {errors.type && (
                <FormErrorMessage>{errors.type.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.title}>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <FormLabel>Título do campo</FormLabel>
                <Text fontSize="12px">{watch('title').length || 0}/30</Text>
              </Box>
              <Input
                {...register('title', {
                  onChange: (e) => {
                    const { value } = e.target
                    setValue('title', value)
                    setValue('fieldId', replaceSpacesByUnderscore(value))
                  },
                })}
                placeholder="Insira o título do campo..."
                maxLength={30}
              />
              {errors.title && (
                <FormErrorMessage>{errors.title.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.fieldId}>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <FormLabel>Código do campo</FormLabel>
                <Text fontSize="12px">{watch('fieldId')?.length || 0}/30</Text>
              </Box>
              <Input
                {...register('fieldId', {
                  onChange: (e) =>
                    setValue(
                      'fieldId',
                      replaceSpacesByUnderscore(e.target.value)
                    ),
                })}
                placeholder="Código do campo..."
                maxLength={30}
              />
              {errors.fieldId && (
                <FormErrorMessage>{errors.fieldId.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.placeHolder}>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <FormLabel>Texto de dica do campo</FormLabel>
                <Text fontSize="12px">
                  {watch('placeHolder')?.length || 0}/30
                </Text>
              </Box>
              <Input
                {...register('placeHolder', {
                  onChange: (e) => setValue('placeHolder', e.target.value),
                })}
                placeholder="Insira o texto de dica do campo..."
                maxLength={30}
              />
              {errors.placeHolder && (
                <FormErrorMessage>
                  {errors.placeHolder.message}
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.hint}>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <FormLabel>Texto de ajuda do campo</FormLabel>
                <Text fontSize="12px">{watch('hint')?.length || 0}/240</Text>
              </Box>
              <Textarea
                {...register('hint', {
                  onChange: (e) => setValue('hint', e.target.value),
                })}
                placeholder="Texto de ajuda do campo"
                maxLength={240}
              />
              {errors.hint && (
                <FormErrorMessage>{errors.hint.message}</FormErrorMessage>
              )}
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button colorScheme="gray" onClick={onClose}>
              Cancelar
            </Button>
            <Button isLoading={false} colorScheme="blue" type="submit">
              Salvar
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
