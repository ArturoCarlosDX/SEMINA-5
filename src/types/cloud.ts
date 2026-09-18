export type ServiceStatus = 'active' | 'warning' | 'inactive'
export type RegionStatus = 'operational' | 'degraded' | 'down'
export type ProposalStatus = 'borrador' | 'en_revision' | 'aprobada'
export type CostCategory = 'Compute' | 'Storage' | 'Database' | 'Networking'
export type CostEnvironment = 'dev' | 'staging' | 'production'

export interface Service {
  id: string
  name: string
  category: string
  description: string
  mainFunction: string
  status: ServiceStatus
  quotas: string
  alternatives: string[]
  docsUrl: string
}

export interface AvailabilityZone {
  name: string
  status: ServiceStatus
}

export interface Region {
  id: string
  name: string
  location: string
  deployedServices: string[]
  status: RegionStatus
  latencyMs: number
  availabilityZones: AvailabilityZone[]
}

export interface CloudProposal {
  id: string
  solutionName: string
  appType: string
  description: string
  region: string
  estimatedUsers: number
  availabilityLevel: string
  selectedServices: string[]
  migrationGoal: string
  status: ProposalStatus
}

export interface CostItem {
  id: string
  service: string
  quantity: number
  estimatedHours: number
  unitCost: number
  monthlyCost: number
  annualCost: number
  category: CostCategory
  environment: CostEnvironment
}
