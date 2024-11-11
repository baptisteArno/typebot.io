import { loadParameterHeader } from '../helpers/headers';

import Storage from '@octadesk-tech/storage'
import { getBaseClient } from "../http";
import { CommerceServicesType, ListCatalogType, ProductType } from "./commerce.type";

const getCommerceClient = () => getBaseClient('commerce');

export const CommerceService: CommerceServicesType = {
  getList: async (): Promise<Array<ListCatalogType>> => {
    try {
      const { data }: any = await getCommerceClient().then(client => (
        client.get('/catalogs', loadParameterHeader())
      ))
      return data.results as Array<ListCatalogType>;
    } catch (ex) {
      throw new Error('Error in get Catalogs: ' + ex)
    }
  },
  getProductsInCatalog: async (
    id: string,
    page: number
  ): Promise<{ products: Array<ProductType>; total: number }> => {
    try {
      const authStorage = Storage.getItem('auth') as any
      const accessToken = authStorage.access_token

      const { data }: any = await getCommerceClient().then((client) =>
        client.get(`/store/products`, {
          params: {
            page,
            limit: '200',
            shouldIncludeVariants: true,
          },
          ...loadParameterHeader(),
        })
      )
      return {
        products: data.results as Array<ProductType>,
        total: data.total as number,
      }
    } catch (ex) {
      throw new Error('Error in get product: ' + ex)
    }
  },
  getVariants: async (catalogId: string, productId: string): Promise<Array<ProductType>> => {
    try {
      const { data }: any = await getCommerceClient().then(client =>
        client.get(`/catalogs/${catalogId}/products/${productId}/variants`, {
          params: {
            page: '1',
            limit: '200',
            shouldIncludeVariants: true,
          },
          ...loadParameterHeader(),
        })
      )
      return data.results;
    } catch (ex) {
      throw new Error('Error in get product: ' + ex)
    }
  },
};
