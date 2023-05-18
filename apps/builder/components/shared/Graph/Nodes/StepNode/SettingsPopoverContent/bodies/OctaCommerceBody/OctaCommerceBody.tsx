import OctaLoading from 'components/octaComponents/OctaLoading/OctaLoading';
import { useTypebot } from 'contexts/TypebotContext';
import { CommerceOptions, Step } from 'models'
import React, { useEffect, useState } from 'react'
import { CommerceService } from 'services/octadesk/commerce/commerce';
import { ListCatalogType, ProductType } from 'services/octadesk/commerce/commerce.type';
import {
  ButtonCreate,
  Container,
  FormArea,
  Title,
  FormControl,
} from './OctaCommerceBody.style'
import SelectProducts from './SelectProducts/SelectProducts';

type Props = {
  options: CommerceOptions
  onOptionsChange: (options: CommerceOptions) => void
}

export const OctaCommerceBody = ({ options, onOptionsChange }: Props) => {
  const [catalog, setCatalog] = useState<Array<ListCatalogType>>();
  const [products, setProducts] = useState<Array<ProductType>>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getCatalogs = async (): Promise<void> => {
      CommerceService.getList().then(data => {
        options.catalogId = data[0].id
        setCatalog(data);
        setLoading(false);
      })
    }
    if (!catalog || !catalog.length) {
      getCatalogs();
    }
    return () => {
      setCatalog(undefined)
    }
  }, [])

  useEffect(() => {
    const getProducts = async (catalogId: string): Promise<void> => {
      CommerceService.getProductsInCatalog(catalogId).then(data => {
        setProducts(data);
        setLoading(false);
      })
    }
    if (catalog && catalog.length > 0) {
      getProducts(catalog[0].id);
    }
    return () => {
      setProducts(undefined)
    }
  }, [catalog])

  const handleSelectProducts = (product: ProductType) => {
    let newProducts = [...options.products]
    const index = newProducts.findIndex(p => p === product.id)
    if (index >= 0) {
      newProducts.splice(index, 1)
    } else {
      newProducts.push(product.id)
    }

    onOptionsChange({
      ...options,
      ...{ products: newProducts },
    });
  }

  return (
    <>
      <Container>
        <Title>
          Enviar catálogo
        </Title>
        {loading && <OctaLoading />}
        {products && <SelectProducts key={catalog?.id} selectedProducts={options.products} products={products} onSelect={handleSelectProducts} />}

      </Container>
    </>
  )
}
