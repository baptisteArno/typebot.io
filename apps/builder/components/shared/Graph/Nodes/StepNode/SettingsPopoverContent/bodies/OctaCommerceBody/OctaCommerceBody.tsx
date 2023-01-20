import OctaLoading from 'components/octaComponents/OctaLoading/OctaLoading';
import { useTypebot } from 'contexts/TypebotContext';
import { Step, StepOptions } from 'models'
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
  step: StepOptions;
  onOptionsChange: (options: any) => void;
  onExpand?: () => void;
}

export const OctaCommerceBody = ({ step, onExpand, onOptionsChange }: Props) => {
  const [catalog, setCatalog] = useState<Array<ListCatalogType>>();
  const [products, setProducts] = useState<Array<ProductType>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProducts, setSelectedProducts] = useState<Array<string>>(step.options);

  useEffect(() => {
    const getCatalogs = async (): Promise<void> => {
      CommerceService.getList().then(data => {
        setCatalog(data);
        setLoading(false);
      })
    }
    if(!catalog || !catalog.length){
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
    if(catalog && catalog.length > 0){
      getProducts(catalog[0].id);
    }
    return () => {
      setCatalog(undefined)
    }
  }, [catalog])

  const handleSelectProducts = (product: ProductType) => {
    if(!step.options){
      return [product.id];
    }
    const products = [];
    products.push(product.id)
    onOptionsChange(products);
  }

  return (
    <>
      <Container>
        <Title>
          Enviar catálogo
        </Title>
        {loading && <OctaLoading />}
        {products && <SelectProducts products={products} onSelect={handleSelectProducts}/>}

      </Container>
    </>
  )
}
