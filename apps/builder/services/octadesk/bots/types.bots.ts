export type BotsServicesInterface = {
  getBotSpecifications: () => Promise<any>
  getBots: (channel: string, version: number) => Promise<any>
}
