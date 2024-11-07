import OctaLoading from 'components/octaComponents/OctaLoading/OctaLoading'
import { CommerceOptions, TextBubbleContent, Variable } from 'models'
import React, { useCallback, useEffect, useState } from 'react'
import { CommerceService } from 'services/octadesk/commerce/commerce'
import {
  ListCatalogType,
  ProductType,
} from 'services/octadesk/commerce/commerce.type'
import { Title } from './OctaCommerceBody.style'
import SelectProducts from './SelectProducts/SelectProducts'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { Flex, FormLabel, Spacer, Stack } from '@chakra-ui/react'
import { TextBubbleEditor } from '../../../TextBubbleEditor'

type Props = {
  options: CommerceOptions
  onOptionsChange: (options: CommerceOptions) => void
}

const MAX_LENGHT_TEXT = 500

export const OctaCommerceBody = ({ options, onOptionsChange }: Props) => {
  const [catalog, setCatalog] = useState<Array<ListCatalogType>>()
  const [products, setProducts] = useState<Array<ProductType>>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)
  const [totalProducts, setTotalProducts] = useState<number>(0)
  const scrollContainerId = 'scroll-container'

  useEffect(() => {
    const getCatalogs = async (): Promise<void> => {
      CommerceService.getList().then((data) => {
        options.catalogId = data && data.length ? data[0].id : ''
        setCatalog(data)
        setLoading(false)
      })
    }
    if (!catalog || !catalog.length) {
      getCatalogs()
    }
    return () => {
      setCatalog(undefined)
    }
  }, [])

  useEffect(() => {
    loadProducts(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog])

  const loadProducts = useCallback(
    async (page: number) => {
      if (loading) return
      if (catalog && catalog.length > 0) {
        setLoading(true)
        const { products: newProducts, total } =
          await CommerceService.getProductsInCatalog(catalog[0].id, page)
        setProducts((prevProducts) => [...prevProducts, ...newProducts])
        setTotalProducts(total)
        setLoading(false)
      }
    },
    [catalog, loading]
  )

  const handleScroll = useCallback(() => {
    const container = document.getElementById(scrollContainerId)
    if (
      container &&
      container.scrollHeight - container.scrollTop === container.clientHeight &&
      !loading &&
      products.length < totalProducts
    ) {
      const nextPage = page + 1
      setPage(nextPage)
      loadProducts(nextPage)
    }
  }, [loadProducts, loading, page, products.length, totalProducts])

  useEffect(() => {
    const container = document.getElementById(scrollContainerId)
    container?.addEventListener('scroll', handleScroll)
    return () => container?.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleSelectProducts = (products: ProductType[], add = false) => {
    const newProducts = [...options.products]
    products.forEach((product) => {
      const index = newProducts.findIndex((p) => p === product.id)
      if (index >= 0) {
        if (!add) newProducts.splice(index, 1)
      } else {
        newProducts.push(product.id)
      }
    })

    onOptionsChange({
      ...options,
      ...{ products: newProducts },
    })
  }

  const handleVariableSelected = (variable: Variable) => {
    onOptionsChange({
      ...options,
      variableId: variable.id,
      property: {
        domain: 'CHAT',
        name: variable.name,
        type: variable.type ? variable.type : 'string',
        token: variable.token,
      },
    })
  }
  const handleCloseEditorBotMessage = (content: TextBubbleContent) => {
    onOptionsChange({
      ...options,
      message: content,
    })
  }

  return (
    <Stack>
      <Title>Enviar catálogo</Title>
      <Stack mb={4}>
        <Flex>
          <FormLabel mb="0" htmlFor="placeholder">
            Mensagem enviada com o catálogo
          </FormLabel>
          <Spacer />
          <FormLabel mb="0" htmlFor="button">
            {options?.message?.plainText?.length ?? 0}/{MAX_LENGHT_TEXT}
          </FormLabel>
        </Flex>
        (
        <TextBubbleEditor
          maxLength={500}
          required
          increment={1}
          onClose={handleCloseEditorBotMessage}
          initialValue={options.message ? options.message.richText : []}
          onKeyUp={handleCloseEditorBotMessage}
        />
        )
      </Stack>
      {loading && <OctaLoading />}
      {products && (
        <SelectProducts
          key={options.catalogId}
          selectedProducts={options.products}
          products={products}
          onSelect={handleSelectProducts}
          scrollContainerId={scrollContainerId}
        />
      )}
      <VariableSearchInput
        initialVariableId={options?.variableId}
        onSelectVariable={handleVariableSelected}
        placeholder="Salvar resposta em..."
        width={'100%'}
      />
    </Stack>
  )
}
