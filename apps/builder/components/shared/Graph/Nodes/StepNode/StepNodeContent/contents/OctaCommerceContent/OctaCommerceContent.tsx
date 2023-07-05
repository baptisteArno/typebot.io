import { CommerceOptions } from 'models'
import React from 'react'
import { BoxContainer, Container, SelectedProducts, Space } from './OctaCommerceContent.style'
import { WithVariableContent } from '../WithVariableContent'
import { Stack, Text } from '@chakra-ui/react'

type Props = {
  options: CommerceOptions
}

const OctaCommerceContent = ({ options }: Props) => {
  return (
    <>
      <Container>
        <BoxContainer>
          {
            <Stack>
              <Text color={'gray.500'} noOfLines={0}>
                  <strong>Mensagem enviada com o catálogo:</strong>
              </Text>
              <Text color={'gray.500'} noOfLines={0}>
                <label>{options.message?.plainText}</label>
              </Text>
            </Stack>
          }
        </BoxContainer>
        <BoxContainer>
          {!options?.products?.length &&
            <Text color={'gray.500'} noOfLines={0}>Nenhum produto selecionado</Text>
          }
          {options && options.products && options.products.length > 0 &&
            <>
              <div>
                {options.products.length}
                {options.products.length > 1 && <SelectedProducts>produtos selecionados</SelectedProducts>}
                {options.products.length == 1 && <SelectedProducts>produto selecionado</SelectedProducts>}
              </div>
            </>
          }
        </BoxContainer>


        <Space>
          <WithVariableContent variableId={options?.variableId} />
        </Space>
      </Container>
    </>
  )
}

export default OctaCommerceContent
