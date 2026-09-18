import type { CostItem } from '../types/cloud'

export const costs: CostItem[] = [
  {
    id: 'ec2',
    service: 'EC2',
    quantity: 6,
    estimatedHours: 730,
    unitCost: 120,
    monthlyCost: 720,
    annualCost: 8640,
    category: 'Compute',
    environment: 'production'
  },
  {
    id: 's3',
    service: 'S3',
    quantity: 2000,
    estimatedHours: 730,
    unitCost: 0.023,
    monthlyCost: 46,
    annualCost: 552,
    category: 'Storage',
    environment: 'staging'
  },
  {
    id: 'rds',
    service: 'RDS',
    quantity: 2,
    estimatedHours: 730,
    unitCost: 185,
    monthlyCost: 370,
    annualCost: 4440,
    category: 'Database',
    environment: 'production'
  },
  {
    id: 'cloudfront',
    service: 'CloudFront',
    quantity: 1,
    estimatedHours: 730,
    unitCost: 95.5,
    monthlyCost: 95.5,
    annualCost: 1146,
    category: 'Networking',
    environment: 'production'
  },
  {
    id: 'route53',
    service: 'Route 53',
    quantity: 12,
    estimatedHours: 730,
    unitCost: 5,
    monthlyCost: 60,
    annualCost: 720,
    category: 'Networking',
    environment: 'dev'
  },
  {
    id: 'vpc',
    service: 'VPC (NAT Gateway)',
    quantity: 3,
    estimatedHours: 730,
    unitCost: 45,
    monthlyCost: 135,
    annualCost: 1620,
    category: 'Networking',
    environment: 'staging'
  }
]

export default costs