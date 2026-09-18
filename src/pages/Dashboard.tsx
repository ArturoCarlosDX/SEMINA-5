import { useState } from 'react'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Gauge,
  Globe,
  Info,
  Key,
  Server,
  ShieldCheck,
  type LucideIcon
} from 'lucide-react'
import CostDistribution from '../components/CostDistribution'
import StatCard from '../components/StatCard'
import StatCardTrend from '../components/StatCardTrend'
import SecurityCard from '../components/SecurityCard'
import { useTheme } from '../hooks/useTheme'
import { awsServices } from '../data/awsServices'
import { regions } from '../data/regions'
import { costs } from '../data/costs'

interface LogEvent {
  id: string
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
  message: string
}

const currency = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
})

const COST_DISTRIBUTION = [
  { name: 'Compute', value: 800, color: '#2563EB' },
  { name: 'Database', value: 370, color: '#F59E0B' },
  { name: 'Networking', value: 140, color: '#16A34A' },
  { name: 'CDN', value: 100, color: '#DC2626' },
  { name: 'DNS', value: 70, color: '#4F46E5' },
  { name: 'Storage', value: 50, color: '#06B6D4' }
]

const ACTIVE_SERVICES_HISTORY = [4, 4, 5, 5, 5, 6, 6]
const MONTHLY_COST_HISTORY = [1180, 1230, 1290, 1335, 1380, 1410, 1426.5]
const ANNUAL_COST_HISTORY = [14300, 14950, 15500, 16050, 16500, 16900, 17118]

const severityColors: Record<
  LogEvent['severity'],
  { icon: LucideIcon; classes: string }
> = {
  critical: {
    icon: AlertCircle,
    classes: 'bg-danger/10 text-danger dark:bg-darkDanger/10 dark:text-darkDanger'
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-warning/10 text-warning dark:bg-darkWarning/10 dark:text-darkWarning'
  },
  info: {
    icon: Info,
    classes: 'bg-primary/10 text-primary dark:bg-darkPrimary/10 dark:text-darkPrimary'
  }
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function createInitialEvents(): LogEvent[] {
  return [
    {
      id: 'evt-1',
      timestamp: minutesAgo(4),
      severity: 'warning',
      message: 'Uso de CPU en EC2 us-east-1 superó el 60%.'
    },
    {
      id: 'evt-2',
      timestamp: minutesAgo(18),
      severity: 'info',
      message: 'Deploy de CloudFront completado correctamente.'
    },
    {
      id: 'evt-3',
      timestamp: minutesAgo(45),
      severity: 'critical',
      message: 'RDS sa-east-1 alcanzó el 90% de almacenamiento.'
    },
    {
      id: 'evt-4',
      timestamp: minutesAgo(80),
      severity: 'info',
      message: 'Backup automático de base de datos generado.'
    },
    {
      id: 'evt-5',
      timestamp: minutesAgo(140),
      severity: 'warning',
      message: 'Latencia en Route 53 por encima del umbral en eu-west-1.'
    },
    {
      id: 'evt-6',
      timestamp: minutesAgo(300),
      severity: 'info',
      message: 'Nuevo bucket S3 creado para logs de auditoría.'
    },
    {
      id: 'evt-7',
      timestamp: minutesAgo(720),
      severity: 'info',
      message: 'Escalado automático del ASG en us-east-1 activado.'
    },
    {
      id: 'evt-8',
      timestamp: minutesAgo(1440),
      severity: 'critical',
      message: 'Certificado TLS de api.example.com a 30 días de expirar.'
    }
  ]
}

function formatRelative(timestamp: string): string {
  const diffMinutes = Math.max(1, Math.round((Date.now() - new Date(timestamp).getTime()) / 60_000))
  if (diffMinutes < 60) return `hace ${diffMinutes} min`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `hace ${diffHours} h`
  return `hace ${Math.round(diffHours / 24)} d`
}

export default function Dashboard() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [trafficLoad, setTrafficLoad] = useState(false)
  const [events, setEvents] = useState<LogEvent[]>(createInitialEvents)

  const activeServices = awsServices.filter((service) => service.status === 'active').length
  const operationalRegions = regions.filter((region) => region.status === 'operational').length
  const mainRegion = regions[0]

  const totalMonthly = costs.reduce((sum, item) => sum + item.monthlyCost, 0)
  const totalAnnual = costs.reduce((sum, item) => sum + item.annualCost, 0)

  const loadFactor = trafficLoad ? 1.22 : 1

  const servicesValue = trafficLoad ? String(activeServices + 3) : String(activeServices)
  const servicesTrend = trafficLoad ? '↑ +50% bajo carga' : '+1 vs mes anterior'
  const servicesHistory = trafficLoad
    ? ACTIVE_SERVICES_HISTORY.map((value) => value + 2)
    : ACTIVE_SERVICES_HISTORY

  const monthlyValue = currency.format(totalMonthly * loadFactor)
  const monthlyTrend = trafficLoad ? '↑ +22% pico de demanda' : '+4.2% vs mes anterior'
  const monthlyHistory = trafficLoad
    ? MONTHLY_COST_HISTORY.map((value) => Math.round(value * 1.22))
    : MONTHLY_COST_HISTORY

  const annualValue = currency.format(totalAnnual * (trafficLoad ? 1.1 : 1))
  const annualTrend = trafficLoad ? '↑ +10% bajo carga' : '-1.8% vs año anterior'
  const annualHistory = trafficLoad
    ? ANNUAL_COST_HISTORY.map((value) => Math.round(value * 1.1))
    : ANNUAL_COST_HISTORY

  const securityItems = [
    {
      title: 'Identidades bajo control',
      description: '24 usuarios activos y 8 roles configurados con políticas revisadas.',
      status: 'active' as const,
      icon: ShieldCheck
    },
    {
      title: 'MFA incompleto',
      description: 'MFA habilitado en el 72% de las cuentas. Se recomienda exigirlo en todas.',
      status: 'warning' as const,
      icon: Key
    },
    {
      title: 'Parches pendientes',
      description: '3 instancias EC2 presentan actualizaciones de seguridad sin aplicar.',
      status: 'inactive' as const,
      icon: AlertTriangle
    }
  ]

  function handleToggleTraffic() {
    const next = !trafficLoad
    setTrafficLoad(next)
    const event: LogEvent = next
      ? {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          severity: 'warning',
          message: 'Uso de CPU en EC2 us-east-1 superó el 85%.'
        }
      : {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          severity: 'info',
          message: 'La carga de tráfico volvió a niveles normales.'
        }
    setEvents((previous) => [event, ...previous])
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-textPrimary dark:text-darkTextPrimary">Dashboard</h1>
        <p className="mt-2 text-textSecondary dark:text-darkTextSecondary">
          Resumen general de servicios, infraestructura y costos de la nube.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 xl:items-start">
        <div className="space-y-8 xl:col-span-2">
          <section>
            <h2 className="text-lg font-semibold text-textPrimary dark:text-darkTextPrimary">
              Indicadores clave
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <StatCardTrend
                title="Servicios activos"
                value={servicesValue}
                icon={Server}
                trend={servicesTrend}
                history={servicesHistory}
              />
              <StatCard title="Región principal" value={mainRegion.name} icon={Globe} />
              <StatCardTrend
                title="Costo mensual"
                value={monthlyValue}
                icon={DollarSign}
                trend={monthlyTrend}
                history={monthlyHistory}
              />
              <StatCardTrend
                title="Costo anual"
                value={annualValue}
                icon={Calendar}
                trend={annualTrend}
                history={annualHistory}
              />
              <StatCard
                title="Regiones operativas"
                value={`${operationalRegions} de ${regions.length}`}
                icon={Activity}
              />
            </div>
          </section>

          <CostDistribution data={COST_DISTRIBUTION} />
        </div>

        <aside className="rounded-2xl border border-border bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard xl:sticky xl:top-20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-textPrimary dark:text-darkTextPrimary">
              Alertas y actividad reciente
            </h2>
            <button
              type="button"
              onClick={handleToggleTraffic}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                trafficLoad
                  ? 'border-warning/40 bg-warning/10 text-warning hover:bg-warning/20 dark:border-darkWarning/40 dark:bg-darkWarning/10 dark:text-darkWarning dark:hover:bg-darkWarning/20'
                  : 'border-border bg-background text-textPrimary hover:bg-primary/10 hover:text-primary dark:border-darkBorder dark:bg-darkBackground dark:text-darkTextPrimary dark:hover:bg-darkPrimary/10 dark:hover:text-darkPrimary'
              }`}
            >
              <Gauge className="h-4 w-4" />
              {trafficLoad ? 'Detener simulación' : 'Simular carga de tráfico'}
            </button>
          </div>

          <ul className="mt-2 max-h-80 divide-y divide-border overflow-y-auto dark:divide-darkBorder">
            {events.map((event) => {
              const meta = severityColors[event.severity]
              const Icon = meta.icon
              return (
                <li key={event.id} className="flex animate-slide-in items-start gap-3 py-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.classes}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-textPrimary dark:text-darkTextPrimary">
                      {event.message}
                    </p>
                    <p className="mt-0.5 text-xs text-textSecondary dark:text-darkTextSecondary">
                      {formatRelative(event.timestamp)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </aside>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-textPrimary dark:text-darkTextPrimary">
          Resumen de seguridad
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {securityItems.map(({ icon, ...item }) => (
            <SecurityCard key={item.title} icon={icon} {...item} />
          ))}
        </div>
      </section>
    </div>
  )
}