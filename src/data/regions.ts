import type { Region } from '../types/cloud'

export const regions: Region[] = [
  {
    id: 'us-east-1',
    name: 'US East (N. Virginia)',
    location: 'Virginia, USA',
    deployedServices: ['ec2', 's3', 'rds', 'iam', 'vpc', 'route53', 'cloudfront'],
    status: 'operational',
    latencyMs: 80,
    availabilityZones: [
      { name: 'us-east-1a', status: 'active' },
      { name: 'us-east-1b', status: 'active' },
      { name: 'us-east-1c', status: 'warning' }
    ]
  },
  {
    id: 'sa-east-1',
    name: 'South America (São Paulo)',
    location: 'São Paulo, Brazil',
    deployedServices: ['ec2', 's3', 'rds', 'vpc'],
    status: 'degraded',
    latencyMs: 25,
    availabilityZones: [
      { name: 'sa-east-1a', status: 'active' },
      { name: 'sa-east-1b', status: 'warning' },
      { name: 'sa-east-1c', status: 'active' }
    ]
  },
  {
    id: 'eu-west-1',
    name: 'EU (Ireland)',
    location: 'Dublin, Ireland',
    deployedServices: ['ec2', 's3', 'rds', 'iam', 'vpc', 'route53'],
    status: 'operational',
    latencyMs: 145,
    availabilityZones: [
      { name: 'eu-west-1a', status: 'active' },
      { name: 'eu-west-1b', status: 'active' },
      { name: 'eu-west-1c', status: 'active' }
    ]
  },
  {
    id: 'ap-southeast-1',
    name: 'Asia Pacific (Singapore)',
    location: 'Singapore',
    deployedServices: ['ec2', 's3', 'cloudfront', 'vpc'],
    status: 'operational',
    latencyMs: 225,
    availabilityZones: [
      { name: 'ap-southeast-1a', status: 'active' },
      { name: 'ap-southeast-1b', status: 'warning' },
      { name: 'ap-southeast-1c', status: 'active' }
    ]
  }
]

export default regions