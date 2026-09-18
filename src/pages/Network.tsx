import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Box,
  Database,
  Globe,
  Network as NetworkIcon,
  RotateCcw,
  Server,
  Shield,
  XCircle,
  type LucideIcon
} from 'lucide-react'

interface FlowNodeProps {
  icon: LucideIcon
  name: string
  description: string
  tone?: 'default' | 'error'
}

function FlowNode({ icon: Icon, name, description, tone = 'default' }: FlowNodeProps) {
  const isError = tone === 'error'

  return (
    <div
      className={`flex flex-1 flex-col items-center rounded-2xl border p-4 text-center shadow-sm ${
        isError
          ? 'border-danger/60 bg-danger/5 dark:border-darkDanger/60 dark:bg-darkDanger/10'
          : 'border-border bg-white dark:border-darkBorder dark:bg-darkCard'
      }`}
    >
      <div
        className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${
          isError
            ? 'bg-danger/10 text-danger dark:bg-darkDanger/10 dark:text-darkDanger'
            : 'bg-primary/10 text-primary dark:bg-darkPrimary/10 dark:text-darkPrimary'
        }`}
      >
        <Icon className={`h-6 w-6 ${isError ? 'opacity-40' : ''}`} />
        {isError && (
          <span className="animate-node-alert absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white shadow-sm dark:bg-darkDanger">
            <AlertTriangle className="h-3 w-3" />
          </span>
        )}
      </div>
      <h3
        className={`mt-3 text-sm font-semibold ${
          isError
            ? 'text-danger dark:text-darkDanger'
            : 'text-textPrimary dark:text-darkTextPrimary'
        }`}
      >
        {name}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-textSecondary dark:text-darkTextSecondary">
        {description}
      </p>
      {isError && (
        <span className="mt-2 rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-semibold text-danger dark:bg-darkDanger/10 dark:text-darkDanger">
          Nodo caído
        </span>
      )}
    </div>
  )
}

type FlowArrowVariant = 'normal' | 'broken' | 'fallback'

function FlowArrow({ variant = 'normal' }: { variant?: FlowArrowVariant }) {
  const isError = variant !== 'normal'

  return (
    <div className="flex flex-col items-center justify-center gap-1 py-1 lg:flex-row lg:gap-2 lg:px-1 lg:py-0">
      <div className="flex items-center gap-2">
        <span
          className={`flow-dash h-4 w-0.5 rotate-90 lg:h-0.5 lg:w-10 ${
            isError
              ? 'text-danger dark:text-darkDanger'
              : 'text-textSecondary dark:text-darkTextSecondary'
          }`}
          aria-hidden="true"
        />
        {variant === 'broken' ? (
          <XCircle
            className="h-5 w-5 text-danger dark:text-darkDanger"
            aria-hidden="true"
          />
        ) : (
          <ArrowRight
            className={`h-5 w-5 rotate-90 lg:rotate-0 ${
              isError
                ? 'text-danger dark:text-darkDanger'
                : 'animate-flow-arrow text-textSecondary dark:text-darkTextSecondary'
            }`}
            aria-hidden="true"
          />
        )}
      </div>
      {variant === 'broken' && (
        <span className="text-xs font-semibold text-danger dark:text-darkDanger">
          Enlace interrumpido
        </span>
      )}
      {variant === 'fallback' && (
        <span className="text-xs font-semibold text-danger dark:text-darkDanger">
          Ruta de fallback activada
        </span>
      )}
    </div>
  )
}

function SubnetResource({
  icon: Icon,
  name,
  description,
  tone
}: {
  icon: LucideIcon
  name: string
  description: string
  tone: 'success' | 'warning'
}) {
  const toneClasses =
    tone === 'success'
      ? 'border-success/40 bg-success/5 text-success dark:border-darkSuccess/40 dark:bg-darkSuccess/10 dark:text-darkSuccess'
      : 'border-warning/40 bg-warning/5 text-warning dark:border-darkWarning/40 dark:bg-darkWarning/10 dark:text-darkWarning'

  return (
    <div className={`flex items-center gap-2 rounded-lg border p-2 ${toneClasses}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-textPrimary dark:text-darkTextPrimary">{name}</p>
        <p className="truncate text-xs text-textSecondary dark:text-darkTextSecondary">{description}</p>
      </div>
    </div>
  )
}

interface SecurityGroupRule {
  port: string
  protocol: string
  origin: string
  resource: string
  access: 'open' | 'restricted'
}

const securityGroupRules: SecurityGroupRule[] = [
  {
    port: '80 / 443',
    protocol: 'TCP',
    origin: '0.0.0.0/0',
    resource: 'CloudFront',
    access: 'open'
  },
  {
    port: '443',
    protocol: 'TCP',
    origin: '0.0.0.0/0',
    resource: 'Application Load Balancer',
    access: 'open'
  },
  {
    port: '22',
    protocol: 'TCP',
    origin: '203.0.113.10/32',
    resource: 'EC2 (bastion)',
    access: 'restricted'
  },
  {
    port: '3306',
    protocol: 'TCP',
    origin: '10.0.0.0/16 (VPC)',
    resource: 'RDS',
    access: 'restricted'
  },
  {
    port: '6379',
    protocol: 'TCP',
    origin: '10.0.1.0/24 (subred privada)',
    resource: 'ElastiCache',
    access: 'restricted'
  }
]

export default function Network() {
  const [cloudFrontDown, setCloudFrontDown] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary dark:text-darkTextPrimary">
          Arquitectura de Red
        </h1>
        <p className="mt-2 text-textSecondary dark:text-darkTextSecondary">
          Flujo del tráfico desde Internet hasta los recursos dentro de la VPC.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-textPrimary dark:text-darkTextPrimary">
          <NetworkIcon className="h-5 w-5 text-primary dark:text-darkPrimary" />
          Flujo de tráfico
        </h2>
        {cloudFrontDown ? (
          <button
            type="button"
            onClick={() => setCloudFrontDown(false)}
            className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-success/40"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar CloudFront
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCloudFrontDown(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-danger/90 focus:outline-none focus:ring-2 focus:ring-danger/40"
          >
            <AlertTriangle className="h-4 w-4" />
            Simular caída de CloudFront
          </button>
        )}
      </div>

      {cloudFrontDown && (
        <div className="flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm text-danger dark:border-darkDanger/40 dark:bg-darkDanger/10 dark:text-darkDanger">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          CloudFront no disponible: el tráfico se enruta directo a la VPC por la ruta de
          contingencia.
        </div>
      )}

      <div className="rounded-2xl border border-border bg-white p-4 shadow-sm dark:border-darkBorder dark:bg-darkCard sm:p-6">
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:gap-2">
          <FlowNode
            icon={Globe}
            name="Internet"
            description="Usuarios y tráfico externo que acceden a la aplicación."
          />

          <FlowArrow />

          <FlowNode
            icon={Server}
            name="Route 53"
            description="DNS que resuelve el dominio y enruta las solicitudes."
          />

          <FlowArrow variant={cloudFrontDown ? 'broken' : 'normal'} />

          <FlowNode
            icon={NetworkIcon}
            name="CloudFront"
            description="CDN que cachea contenido y reduce la latencia global."
            tone={cloudFrontDown ? 'error' : 'default'}
          />

          <FlowArrow variant={cloudFrontDown ? 'fallback' : 'normal'} />

          <div className="flex flex-1 flex-col rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 dark:border-darkPrimary/40 dark:bg-darkPrimary/10">
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5 text-primary dark:text-darkPrimary" />
              <h3 className="text-sm font-semibold text-textPrimary dark:text-darkTextPrimary">VPC</h3>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-textSecondary dark:text-darkTextSecondary">
              Red virtual aislada con subredes públicas y privadas.
            </p>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-success/40 bg-white p-3 dark:border-darkSuccess/40 dark:bg-darkCard">
                <p className="text-xs font-semibold uppercase tracking-wide text-success dark:text-darkSuccess">
                  Subred pública
                </p>
                <div className="mt-2">
                  <SubnetResource
                    icon={Server}
                    name="EC2"
                    description="Capacidad de cómputo"
                    tone="success"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-warning/40 bg-white p-3 dark:border-darkWarning/40 dark:bg-darkCard">
                <p className="text-xs font-semibold uppercase tracking-wide text-warning dark:text-darkWarning">
                  Subred privada
                </p>
                <div className="mt-2">
                  <SubnetResource
                    icon={Database}
                    name="RDS"
                    description="Base de datos gestionada"
                    tone="warning"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-textSecondary dark:text-darkTextSecondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-success dark:bg-darkSuccess" /> Subred pública
          (acceso a Internet)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-warning dark:bg-darkWarning" /> Subred privada
          (sin exposición directa)
        </span>
      </div>

      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-textPrimary dark:text-darkTextPrimary">
          <Shield className="h-5 w-5 text-primary dark:text-darkPrimary" />
          Grupos de Seguridad
        </h2>
        <p className="mt-1 text-sm text-textSecondary dark:text-darkTextSecondary">
          Reglas de ingreso más relevantes por recurso.
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-white shadow-sm dark:border-darkBorder dark:bg-darkCard">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border dark:border-darkBorder">
                <th className="py-3 pl-6 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                  Puerto
                </th>
                <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                  Protocolo
                </th>
                <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                  Origen
                </th>
                <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                  Recurso
                </th>
                <th className="py-3 pr-6 text-right text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                  Acceso
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-darkBorder">
              {securityGroupRules.map((rule) => (
                <tr key={`${rule.port}-${rule.resource}`}>
                  <td className="py-3 pl-6 pr-4 font-mono font-medium text-textPrimary dark:text-darkTextPrimary">
                    {rule.port}
                  </td>
                  <td className="py-3 pr-4 text-textSecondary dark:text-darkTextSecondary">
                    {rule.protocol}
                  </td>
                  <td className="py-3 pr-4 font-mono text-textSecondary dark:text-darkTextSecondary">
                    {rule.origin}
                  </td>
                  <td className="py-3 pr-4 font-medium text-textPrimary dark:text-darkTextPrimary">
                    {rule.resource}
                  </td>
                  <td className="py-3 pr-6 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        rule.access === 'open'
                          ? 'bg-success/10 text-success dark:bg-darkSuccess/10 dark:text-darkSuccess'
                          : 'bg-warning/10 text-warning dark:bg-darkWarning/10 dark:text-darkWarning'
                      }`}
                    >
                      {rule.access === 'open' ? 'Abierto' : 'Restringido'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}