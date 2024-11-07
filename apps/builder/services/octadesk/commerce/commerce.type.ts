export type CommerceServicesType = {
  getList: () => Promise<Array<ListCatalogType>>;
  getProductsInCatalog: (
    id: string,
    page: number
  ) => Promise<{ products: Array<ProductType>; total: number }>;
  getVariants: (catalogId: string, productId: string) => Promise<Array<ProductType>>
}

export type ListCatalogType = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  integration: Array<CommerceIntegrationType>
}

export type CommerceIntegrationType = {
  id: string;
  subdomain: string;
  catalogId: string;
  status: number;
  integrationName: string;
  integrationId: string;
  createdAt: Date;
  updatedAt: Date;
  response: string;
}

export type ProductType = {
  id: string;
  subdomain: string;
  sku: string;
  name: string;
  brand:string;
  condition: string;
  description: string;
  price: number;
  offerPrice: number;
  currency: string;
  stock: number;
  active: boolean;
  link: string;
  imageUrl: string;
  createdBy: Date;
  createdAt: Date;
  updatedBy: Date;
  source: string;
  externalId: string;
  integrations: Array<ProductIntegration>;
  isPromo: boolean;
  attributes: Array<{
    code: string;
    id: string;
    name: string;
    values: Array<{
      code: string;
      id: string;
      value: string;
    }>
  }>,
  variants: Array<any>
}

export type ProductIntegration = {
  id: string;
  subdomain: string;
  productId: string;
  status: number;
  integrationName: string;
  integrationId: string;
  integrationStatus: string;
  integrationSku: string;
  createdAt: Date;
  updatedAt: Date;
  response: string;
}

export type VariationWithSelection = {
  variationId: string, 
  value?: string
}
