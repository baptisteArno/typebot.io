import { CommerceOptions } from 'models'
import React from 'react'
import { Container, SelectedProducts, Space } from './OctaCommerceContent.style'
import { WithVariableContent } from '../WithVariableContent'

type Props = {
  options: CommerceOptions
}

const OctaCommerceContent = ({ options }: Props) => {
  return (
    <>
      <Container>

        {!options.products?.length && 
          <div>Nenhum produto selecionado</div>
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
        <Space>
          <WithVariableContent variableId={options.variableId} />
        </Space>
      </Container>
    </>
  )
}

export default OctaCommerceContent
