import { CommerceOptions } from 'models'
import React from 'react'
import { Container, SelectedProducts } from './OctaCommerceContent.style'
import { WithVariableContent } from '../WithVariableContent'

type Props = {
  options: CommerceOptions
}

const OctaCommerceContent = ({ options }: Props) => {
  return (
    <>
      <Container>

        {(!options || !options.products?.length) && 
          <div>Nenhum produto selecionado</div>
        }
        {options && options.products &&
          <>
            <div>
              {options.products.length}
              {options.products.length > 1 && <SelectedProducts>produtos selecionados</SelectedProducts>}
              {options.products.length == 1 && <SelectedProducts>produto selecionado</SelectedProducts>}
            </div>
          </>
        }
        <WithVariableContent variableId={options.variableId} />
        
      </Container>
    </>
  )
}

export default OctaCommerceContent