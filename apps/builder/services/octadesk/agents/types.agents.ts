export interface AgentsServicesInterface {
  activeAgent: (idAgent: string) => Promise<any>,
  inactiveAgent: (idAgent: string) => Promise<any>,
  activeAgents: (idAgent: string) => Promise<any>,
  getAgents: () => Promise<any>
}
