import OctaSelect from 'components/octaComponents/OctaSelect/OctaSelect'
import React, { useState } from 'react'
import { MdOutlineChevronLeft, MdOutlineChevronRight } from 'react-icons/md'
import { ProductType, VariationWithSelection } from 'services/octadesk/commerce/commerce.type'
import { ButtonCreate } from '../OctaCommerceBody.style'
import { Container, ListProducts, ProductItem, TitleProduct, ImageProduct, ProductContainer, Price, Destination, CustomVariation, ProductVariation, TitleVariation, ContainerVariation, VariationArea, VariationControl, VariationLabel, VariationOption, Instructions } from './SelectProducts.style'
import { Badge } from '@chakra-ui/react'
import Variations from '../Variations/Variations'

type Props = {
  products: Array<ProductType>;
  selectedProducts: Array<string>;
  onSelect: (products: Array<ProductType>, add: boolean) => void;
  scrollContainerId: string;
}

const SelectProducts = ({ products, selectedProducts, onSelect, scrollContainerId }: Props) => {
  const [screen, setScreen] = useState<"LIST" | "VARIATION">("LIST");
  const [variationProduct, setVariationProduct] = useState<ProductType>();
  const [selectedVariations, setSelectedVariations] = useState<Array<VariationWithSelection>>([]);
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

  const handleBackToProducts = (): void => {
    setScreen("LIST");
  };

  const handleSelectProduct = (product: ProductType): void => {
    onSelect([product], false);
  }

  const handleSelectVariation = (variation: any, item: any): void => {
    let index = selectedVariations.findIndex(v => v.variationId === variation.id)
    if (index < 0)
      index = selectedVariations.push({ variationId: variation.id }) - 1

    selectedVariations[index].value = item.label

    setSelectedVariations(selectedVariations)
  }

  const addVariations = () => {
    if (!variationProduct) return
    let selectedVariants = [...variationProduct.variants]
    selectedVariations.forEach(s => {
      selectedVariants = selectedVariants.filter(v => v.attributeValuesHash.includes(s.value))
    })

    selectedVariants.forEach(v => onSelect([v], true))
  }

  const addAllVariations = () => {
    if (!variationProduct) return

    onSelect(variationProduct.variants, true)
    handleBackToProducts()
  }

  const handleRemoveVariation = (variation: any) => {
    onSelect([variation], false)
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
            <ListProducts id={scrollContainerId}>
              {
                products.map((product) => (
                  <>
                    <Variations selectedProducts={selectedProducts} variations={product.variants} onSelect={onSelect} />
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
                        {!product.attributes.length && <input type="checkbox" checked={selectedProducts.includes(product.id)} name="select-product" value={product.id} onChange={(e) => handleSelectProduct(product)} />}
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
            <CustomVariation ><MdOutlineChevronLeft size={40} onClick={() => handleBackToProducts()} /></CustomVariation>
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
                <TitleProduct>Variações selecionadas</TitleProduct>
                <Variations selectedProducts={selectedProducts} variations={variationProduct.variants} onSelect={onSelect} />
                <VariationArea>
                  {variationProduct.attributes.map(variation => (
                    <VariationControl>
                      <VariationLabel>{variation.name}</VariationLabel>
                      <VariationOption>
                        <OctaSelect placeholder={`Selecione um(a) ${variation.name.toLocaleLowerCase()}`} options={variation.values.map(value => ({ key: value.id, label: value.value, value: value.id }))} onChange={(value, item) => handleSelectVariation(variation, item)} />
                      </VariationOption>
                    </VariationControl>
                  ))}
                </VariationArea>
                <ButtonCreate onClick={addVariations}>
                  Adicionar
                </ButtonCreate>
                <ButtonCreate onClick={addAllVariations}>
                  Adicionar Todas
                </ButtonCreate>
              </>
            }
          </ContainerVariation>
        }
      </Container >
    </>
  )
}

export default SelectProducts
