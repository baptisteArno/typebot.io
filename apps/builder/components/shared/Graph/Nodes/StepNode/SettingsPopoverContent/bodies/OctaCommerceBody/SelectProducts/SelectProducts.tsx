import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import React, { MouseEventHandler, useState } from 'react'
import { MdOutlineChevronRight } from 'react-icons/md'
import { ProductType } from 'services/octadesk/commerce/commerce.type'
import { Title } from '../OctaCommerceBody.style'
import { Container, ListProducts, ProductItem, TitleProduct, ImageProduct, ProductContainer, Price, Destination, CustomVariation, ProductVariation, TitleVariation, ContainerVariation, VariationArea, VariationControl, VariationLabel, VariationOption, Instructions } from './SelectProducts.style'

type Props = {
  products: Array<ProductType>
}

const SelectProducts = ({ products }: Props) => {
  const [screen, setScreen] = useState<"LIST" | "VARIATION">("LIST");
  const [variationProduct, setVariationProduct] = useState<ProductType>();
  const convertToBRLCurrency = (value: number, currency: string): string => {
    if (!value) {
      return "";
    }
    return value.toLocaleString("pt-br", { currency: currency, style: 'currency', useGrouping: false, minimumIntegerDigits: 1, minimumFractionDigits: 2 });
  }

  const handleSelectVariations = (product: ProductType): void => {
    setScreen("VARIATION");
    setVariationProduct(product);
  };

  const handleSelectProduct = (product: ProductType): void => {
    console.log("product => ", product);
    
  }

  return (
    <>
      <Instructions>
        Selecione os produtos a serem enviados
      </Instructions>
      <Container>
        {
          (screen === "LIST" && products) &&
          <>
            <ListProducts>
              {
                products.map((product) => (
                  <>
                    <ProductItem key={product.id}>
                      <ImageProduct>
                        {product && product.imageUrl && <img src={product.imageUrl} alt={product.name} />}
                      </ImageProduct>
                      <ProductContainer>
                        <TitleProduct>{product.name}</TitleProduct>
                        <Price>
                          {(product.price && product.offerPrice !== 0) && <><del>{convertToBRLCurrency(product.price, product.currency)}</del> - {convertToBRLCurrency(product.offerPrice, product.currency)}</>}
                          {(product.price && product.offerPrice === 0) && <>{convertToBRLCurrency(product.price, product.currency)}</>}
                        </Price>
                      </ProductContainer>
                      <Destination>
                        {!product.attributes.length && <input type="checkbox" name="select-product" value={product.id} onChange={() => handleSelectProduct(product)} />}
                        {(product.attributes.length > 0) && <CustomVariation onClick={() => handleSelectVariations(product)}><MdOutlineChevronRight size={40} /></CustomVariation>}
                      </Destination>
                    </ProductItem>
                  </>
                ))
              }
            </ListProducts>
          </>
        }
        {
          (screen === "VARIATION" && variationProduct) &&
          <ContainerVariation>
            <TitleVariation>
              Selecione a variação
            </TitleVariation>
            {variationProduct &&
              <>
                <ProductVariation>
                  <ImageProduct>
                    {variationProduct && variationProduct.imageUrl && <img src={variationProduct.imageUrl} alt={variationProduct.name} />}
                  </ImageProduct>
                  <ProductContainer>
                    <TitleProduct>{variationProduct.name}</TitleProduct>
                    <Price>
                      {(variationProduct.price && variationProduct.offerPrice !== 0) && <><del>{convertToBRLCurrency(variationProduct.price, variationProduct.currency)}</del> - {convertToBRLCurrency(variationProduct.offerPrice, variationProduct.currency)}</>}
                      {(variationProduct.price && variationProduct.offerPrice === 0) && <>{convertToBRLCurrency(variationProduct.price, variationProduct.currency)}</>}
                    </Price>
                  </ProductContainer>
                </ProductVariation>
                <VariationArea>
                  {variationProduct.attributes.map(variation => (
                    <VariationControl>
                      <VariationLabel>{variation.name}</VariationLabel>
                      <VariationOption>
                        <OctaSelect placeholder={`Selecione um(a) ${variation.name.toLocaleLowerCase()}`} options={variation.values.map(value => ({ label: value.value, value: value.id }))} onChange={(e) => console.log(e)} />
                      </VariationOption>
                    </VariationControl>
                  ))}
                </VariationArea>
              </>
            }
          </ContainerVariation>
        }
      </Container>
    </>
  )
}

export default SelectProducts