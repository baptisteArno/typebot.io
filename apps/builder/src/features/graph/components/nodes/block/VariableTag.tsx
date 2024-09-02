import { chakra } from '@chakra-ui/react'

type Props = {
  variableName: string
}

export const VariableTag = ({ variableName }: Props) => (
  <chakra.span bgColor="orange.400" color="white" rounded="md" py="0.5" px="1">
    {variableName}
  </chakra.span>
)
