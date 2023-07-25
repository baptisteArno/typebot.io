import { CommerceOptions } from 'models'
import React from 'react'
import { BoxContainer, Container, SelectedProducts, Space } from './OctaCommerceContent.style'
import { WithVariableContent } from '../WithVariableContent'
import { Stack, Text } from '@chakra-ui/react'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { TextHtmlContent } from '../TextHtmlContent'

type Props = {
  options: CommerceOptions
}

const OctaCommerceContent = ({ options }: Props) => {
  return (
    <Stack>
      <TextHtmlContent html={options.message?.html} />
      <OctaDivider />
      {!options?.products?.length &&
        <Text noOfLines={0}>Nenhum produto selecionado</Text>
      }
      {options && options.products && options.products.length > 0 &&
        <Text>
          {options.products.length}
          {options.products.length > 1 && <SelectedProducts>produtos selecionados</SelectedProducts>}
          {options.products.length == 1 && <SelectedProducts>produto selecionado</SelectedProducts>}
        </Text>
      }
      <OctaDivider />
      <WithVariableContent variableId={options?.variableId} property={options?.property} />
    </Stack>
  )
}

export default OctaCommerceContent
