export interface CustomFieldsServicesInterface {
  getCustomFields: () => Promise<any>
  createCustomField: (field: any) => Promise<any>
}
