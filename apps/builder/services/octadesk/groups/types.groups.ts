export interface GroupsServicesInterface {
  getGroups: () => Promise<any>,
  enableGroup: (group: any) => Promise<any>,
  disableGroup: (group: any) => Promise<any>,
  updateGroup: (group: any) => Promise<any>,
  createGroup: (group: any) => Promise<any>,
  removeGroup: (group: any) => Promise<any>,
  removeGroups: (groups: any) => Promise<any>
}
