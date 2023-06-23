import React from 'react'
import { ProductType } from 'services/octadesk/commerce/commerce.type'
import { Badge } from '@chakra-ui/react'

type Props = {
  variations: Array<ProductType> | null;
  selectedProducts: Array<string>;
  onSelect: (products: Array<ProductType>, add: boolean) => void;
}

const Variations = ({ variations, selectedProducts, onSelect }: Props) => {
  const handleRemoveVariation = (variation: any) => {
    onSelect([variation], false)
  }

  return (
    <>
      {variations?.filter((v: any) => selectedProducts.includes(v.id)).map((v: any) => (
        <>
          <Badge variant='solid' colorScheme='blue' borderRadius="6px" textAlign="center" onClick={() => handleRemoveVariation(v)} style={{ cursor: "pointer", marginRight: "3px" }}
            >
            {v.attributeValuesHash}
          </Badge>
        </>
      ))}
    </>
  )
}

export default Variations