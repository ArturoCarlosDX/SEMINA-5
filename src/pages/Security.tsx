import { Fragment, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Eye,
  Fingerprint,
  Globe,
  Key,
  Play,
  Search,
  ShieldCheck,
  UserCog,
  Wrench,
  XCircle,
  type LucideIcon
} from 'lucide-react'
import SecurityScore from '../components/SecurityScore'

interface CustomerControl {
  id: string
  title: string
  description: string
  status: 'warning' | 'active' | 'inactive'
  actionLabel: string
  actionIcon: LucideIcon
}

const awsManaged: { title: string; description: string }[] = [
  {
    title: 'Infraestructura física',
    description: 'Data centers, energía, refrigeración y control de acceso físico.'
  },
  {
    title: 'Red global',
    description: 'Backbone, edge locations y mitigación de ataques DDoS.'
  },
  {
    title: 'Hardware',
    description: 'Servidores, almacenamiento y redes con mantenimiento continuo.'
  }
]

const customerManaged: CustomerControl[] = [
  {
    id: 'iam',
    title: 'Configuración de IAM',
    description: 'Usuarios, roles y permisos dentro de la cuenta.',
    status: 'warning',
    actionLabel: 'Revisar políticas',
    actionIcon: Search
  },
  {
    id: 'cifrado',
    title: 'Cifrado de datos',
    description: 'Cifrado en reposo y en tránsito activo.',
    status: 'active',
    actionLabel: 'Auditar cifrado',
    actionIcon: ShieldCheck
  },
  {
    id: 'accesos',
    title: 'Gestión de accesos',
    description: 'Principio de menor privilegio y rotación de credenciales.',
    status: 'warning',
    actionLabel: 'Configurar MFA',
    actionIcon: Fingerprint
  },
  {
    id: 'parches',
    title: 'Actualizaciones del sistema',
    description: '3 instancias EC2 con parches de seguridad pendientes.',
    status: 'inactive',
    actionLabel: 'Aplicar parche',
    actionIcon: Wrench
  }
]

interface ComplianceRow {
  id: string
  control: string
  category: string
  severity: 'Alta' | 'Media' | 'Baja'
  statusLabel: string
  statusTone: 'success' | 'warning' | 'danger'
  action: string
}

const complianceRows: ComplianceRow[] = [
  { id: 'c1', control: 'MFA obligatorio en cuentas root', category: 'IAM', severity: 'Alta', statusLabel: 'Cumplido', statusTone: 'success', action: 'Ver detalles' },
  { id: 'c2', control: 'Parches de seguridad en EC2', category: 'Cómputo', severity: 'Alta', statusLabel: '3 críticos', statusTone: 'danger', action: 'Resolver' },
  { id: 'c3', control: 'Rotación de Access Keys > 90 días', category: 'IAM', severity: 'Media', statusLabel: 'Advertencia', statusTone: 'warning', action: 'Auditar' },
  { id: 'c4', control: 'Cifrado en reposo (EBS/S3/RDS)', category: 'Cifrado', severity: 'Media', statusLabel: 'Cumplido', statusTone: 'success', action: 'Ver detalles' },
  { id: 'c5', control: 'Políticas con privilegios excesivos', category: 'IAM', severity: 'Alta', statusLabel: 'Advertencia', statusTone: 'warning', action: 'Auditar' },
  { id: 'c6', control: 'Grupos de seguridad sin acceso público', category: 'Red', severity: 'Alta', statusLabel: 'Cumplido', statusTone: 'success', action: 'Ver detalles' },
  { id: 'c7', control: 'Retención de logs CloudTrail (90 días)', category: 'Registro', severity: 'Baja', statusLabel: 'Cumplido', statusTone: 'success', action: 'Ver detalles' },
  { id: 'c8', control: 'Rotación de certificados TLS', category: 'Cifrado', severity: 'Baja', statusLabel: 'Advertencia', statusTone: 'warning', action: 'Auditar' }
]

type ResourceId = 's3' | 'rds' | 'ec2'

interface AuditResource {
  id: ResourceId
  label: string
  permission: string
}

const auditResources: AuditResource[] = [
  { id: 's3', label: 'S3 Bucket', permission: 's3:PutObject' },
  { id: 'rds', label: 'RDS Database', permission: 'rds:ModifyDBInstance' },
  { id: 'ec2', label: 'EC2 Instance', permission: 'ec2:StartInstances' }
]

interface IamUser {
  id: string
  name: string
  initials: string
  role: string
  permissions: string[]
  deny?: string[]
}

const iamUsers: IamUser[] = [
  { id: 'u-1', name: 'Ana Martínez', initials: 'AM', role: 'DevOps Engineer', permissions: ['ec2:*', 's3:*', 'rds:*', 'lambda:*'] },
  { id: 'u-2', name: 'Carlos Ruiz', initials: 'CR', role: 'Backend Developer', permissions: ['ec2:StartInstances', 'ec2:Describe*', 's3:GetObject'] },
  { id: 'u-3', name: 'Laura Gómez', initials: 'LG', role: 'Data Analyst', permissions: ['s3:GetObject', 's3:ListBucket', 'rds:Describe*'] },
  { id: 'u-4', name: 'Pedro Sánchez', initials: 'PS', role: 'Database Admin', permissions: ['rds:*', 'ec2:Describe*'], deny: ['rds:ModifyDBInstance'] },
  { id: 'u-5', name: 'Sofía López', initials: 'SL', role: 'Frontend Developer', permissions: ['s3:GetObject'] }
]

const avatarColors = [
  'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
]

function matchesPermission(userPerm: string, target: string): boolean {
  const [userService, userAction] = userPerm.split(':')
  const [targetService, targetAction] = target.split(':')
  if (userService === '*') return true
  if (userService !== targetService) return false
  if (userAction === '*') return true
  if (userAction.endsWith('*') && targetAction.startsWith(userAction.slice(0, -1))) return true
  return false
}

function hasPermission(permissions: string[], target: string): boolean {
  return permissions.some((p) => matchesPermission(p, target))
}

interface AccessResult {
  allowed: boolean
  explicitDeny: boolean
}

function evaluateAccess(user: IamUser, permission: string): AccessResult {
  if (user.deny?.some((d) => matchesPermission(d, permission))) {
    return { allowed: false, explicitDeny: true }
  }
  return { allowed: hasPermission(user.permissions, permission), explicitDeny: false }
}

function buildSimulationJson(user: IamUser, resource: AuditResource, result: AccessResult): string {
  const evaluated = [
    ...user.permissions.map((p) => ({
      permiso: p,
      tipo: 'Allow' as const,
      coincide: matchesPermission(p, resource.permission)
    })),
    ...(user.deny ?? []).map((p) => ({
      permiso: p,
      tipo: 'Deny' as const,
      coincide: matchesPermission(p, resource.permission)
    }))
  ]

  const payload = {
    evaluador: 'IAM Policy Simulator',
    usuario: { id: user.id, nombre: user.name, rol: user.role },
    recurso: { servicio: resource.label, accionRequerida: resource.permission },
    resultado: {
      efecto: result.allowed ? 'Allow' : 'Deny',
      razon: result.explicitDeny
        ? 'Deny explícito tiene precedencia sobre cualquier Allow'
        : result.allowed
          ? 'Acceso permitido por política adjunta'
          : 'No se encontró política Allow que coincida'
    },
    politicasEvaluadas: evaluated
  }
  return JSON.stringify(payload, null, 2)
}

const resourceStyles: Record<'warning' | 'active' | 'inactive', string> = {
  warning: 'bg-warning/10 text-warning border-warning/30 dark:bg-darkWarning/10 dark:text-darkWarning dark:border-darkWarning/30',
  active: 'bg-success/10 text-success border-success/30 dark:bg-darkSuccess/10 dark:text-darkSuccess dark:border-darkSuccess/30',
  inactive: 'bg-danger/10 text-danger border-danger/30 dark:bg-darkDanger/10 dark:text-darkDanger dark:border-darkDanger/30'
}

const severityStyles: Record<string, string> = {
  Alta: 'bg-danger/10 text-danger dark:bg-darkDanger/10 dark:text-darkDanger',
  Media: 'bg-warning/10 text-warning dark:bg-darkWarning/10 dark:text-darkWarning',
  Baja: 'bg-slate-100 text-slate-600 dark:bg-darkBackground dark:text-darkTextSecondary'
}

const statusToneStyles: Record<string, string> = {
  success: 'bg-success/10 text-success dark:bg-darkSuccess/10 dark:text-darkSuccess',
  warning: 'bg-warning/10 text-warning dark:bg-darkWarning/10 dark:text-darkWarning',
  danger: 'bg-danger/10 text-danger dark:bg-darkDanger/10 dark:text-darkDanger'
}

export default function Security() {
  const [resourceId, setResourceId] = useState<ResourceId>('s3')
  const [results, setResults] = useState<Record<string, AccessResult>>({})
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)

  const activeResource = auditResources.find((r) => r.id === resourceId) ?? auditResources[0]

  function handleResourceChange(id: ResourceId) {
    setResourceId(id)
    setResults({})
    setExpandedUserId(null)
  }

  function handleSimulate(userId: string) {
    const user = iamUsers.find((u) => u.id === userId)
    if (!user) return
    const result = evaluateAccess(user, activeResource.permission)
    setResults((prev) => ({ ...prev, [userId]: result }))
    setExpandedUserId((prev) => (prev === userId ? null : userId))
  }

  return (
    <div className="space-y-8 bg-slate-50 dark:bg-darkBackground -m-4 p-4 sm:-m-6 sm:p-6 lg:-m-8 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary dark:text-darkTextPrimary">
          Security Hub
        </h1>
        <p className="mt-1 text-sm text-textSecondary dark:text-darkTextSecondary">
          Panel central de controles, responsabilidad compartida y auditoría de accesos.
        </p>
      </div>

      <SecurityScore score={55} threats={3} mfaCoverage={72} patches={3} />

      <section>
        <h2 className="flex items-center gap-2 text-base font-semibold text-textPrimary dark:text-darkTextPrimary">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-darkCard">
            <Cloud className="h-4 w-4 text-primary dark:text-darkPrimary" />
          </span>
          Responsabilidad Compartida
        </h2>
        <p className="mt-1 text-sm text-textSecondary dark:text-darkTextSecondary">
          Modelo de responsabilidad de seguridad en la nube según el alcance de cada parte.
        </p>

        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-darkBorder dark:bg-darkCard">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-textPrimary dark:text-darkTextPrimary">
                <Cloud className="h-4 w-4 text-primary dark:text-darkPrimary" />
                AWS Managed
              </h3>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary dark:bg-darkPrimary/10 dark:text-darkPrimary">
                Gestionado por AWS
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {awsManaged.map((item) => (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3.5 dark:border-darkBorder dark:bg-darkBackground"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 dark:bg-darkSuccess/10">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success dark:text-darkSuccess" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-textPrimary dark:text-darkTextPrimary">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-textSecondary dark:text-darkTextSecondary">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-textSecondary dark:text-darkTextSecondary">
              <Globe className="h-3 w-3" />
              AWS opera y asegura la infraestructura subyacente y los controles físicos y de red.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-darkBorder dark:bg-darkCard">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-textPrimary dark:text-darkTextPrimary">
                <UserCog className="h-4 w-4 text-primary dark:text-darkPrimary" />
                Customer Managed
              </h3>
              <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warning dark:bg-darkWarning/10 dark:text-darkWarning">
                Tu responsabilidad
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {customerManaged.map((item) => {
                const Icon = item.actionIcon
                return (
                  <li
                    key={item.id}
                    className="rounded-xl border border-slate-100 p-3.5 dark:border-darkBorder"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-textPrimary dark:text-darkTextPrimary">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-textSecondary dark:text-darkTextSecondary">
                          {item.description}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${resourceStyles[item.status]}`}
                      >
                        {item.status === 'active' && 'Cumplido'}
                        {item.status === 'warning' && 'Revisión'}
                        {item.status === 'inactive' && 'Crítico'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-textPrimary transition-colors hover:bg-slate-50 dark:border-darkBorder dark:bg-darkBackground dark:text-darkTextPrimary dark:hover:bg-darkBorder/50"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.actionLabel}
                      <ArrowRight className="h-3 w-3 opacity-50" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-base font-semibold text-textPrimary dark:text-darkTextPrimary">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-darkCard">
            <ShieldCheck className="h-4 w-4 text-primary dark:text-darkPrimary" />
          </span>
          Cumplimiento de Buenas Prácticas
        </h2>
        <p className="mt-1 text-sm text-textSecondary dark:text-darkTextSecondary">
          Estado actual de las políticas de seguridad y controles de cumplimiento activos.
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-darkBorder dark:bg-darkCard">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-darkBorder dark:bg-darkBackground">
                  <th className="py-3 pl-6 pr-4 text-left text-[11px] font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                    Control de seguridad
                  </th>
                  <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                    Categoría
                  </th>
                  <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                    Severidad
                  </th>
                  <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                    Estado
                  </th>
                  <th className="py-3 pr-6 text-right text-[11px] font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-darkBorder">
                {complianceRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-darkBackground/50">
                    <td className="py-3.5 pl-6 pr-4">
                      <span className="font-medium text-textPrimary dark:text-darkTextPrimary">
                        {row.control}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="font-mono text-xs text-textSecondary dark:text-darkTextSecondary">
                        {row.category}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${severityStyles[row.severity]}`}
                      >
                        {row.severity}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusToneStyles[row.statusTone]}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${row.statusTone === 'success' ? 'bg-success dark:bg-darkSuccess' : row.statusTone === 'warning' ? 'bg-warning dark:bg-darkWarning' : 'bg-danger dark:bg-darkDanger'}`} />
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-textPrimary transition-colors hover:bg-slate-50 dark:border-darkBorder dark:bg-darkBackground dark:text-darkTextPrimary dark:hover:bg-darkBorder/50"
                      >
                        {row.statusTone === 'success' ? (
                          <Eye className="h-3.5 w-3.5 text-textSecondary dark:text-darkTextSecondary" />
                        ) : row.statusTone === 'danger' ? (
                          <Wrench className="h-3.5 w-3.5 text-textSecondary dark:text-darkTextSecondary" />
                        ) : (
                          <Search className="h-3.5 w-3.5 text-textSecondary dark:text-darkTextSecondary" />
                        )}
                        {row.action}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-base font-semibold text-textPrimary dark:text-darkTextPrimary">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-darkCard">
            <Key className="h-4 w-4 text-primary dark:text-darkPrimary" />
          </span>
          Auditoría de roles IAM
        </h2>
        <p className="mt-1 text-sm text-textSecondary dark:text-darkTextSecondary">
          Evalúa políticas de acceso simulando permisos sobre recursos concretos de AWS.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
            Recurso a probar
          </span>
          {auditResources.map((resource) => (
            <button
              key={resource.id}
              type="button"
              onClick={() => handleResourceChange(resource.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                resourceId === resource.id
                  ? 'border-primary bg-primary text-white dark:border-darkPrimary dark:bg-darkPrimary'
                  : 'border-slate-200 bg-white text-textSecondary hover:bg-slate-50 hover:text-textPrimary dark:border-darkBorder dark:bg-darkCard dark:text-darkTextSecondary dark:hover:bg-darkBackground dark:hover:text-darkTextPrimary'
              }`}
            >
              <span className="font-mono">{resource.permission}</span>
              <span className="ml-1 opacity-60">({resource.label})</span>
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-darkBorder dark:bg-darkCard">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-darkBorder dark:bg-darkBackground">
                  <th className="py-3 pl-6 pr-4 text-left text-[11px] font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                    Usuario
                  </th>
                  <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                    Permisos
                  </th>
                  <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                    Último test
                  </th>
                  <th className="py-3 pr-6 text-right text-[11px] font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
                    Simulación
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-darkBorder">
                {iamUsers.map((user, idx) => {
                  const result = results[user.id]
                  const isExpanded = expandedUserId === user.id
                  const json = result ? buildSimulationJson(user, activeResource, result) : null

                  return (
                    <Fragment key={user.id}>
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-darkBackground/50">
                        <td className="py-3.5 pl-6 pr-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${avatarColors[idx % avatarColors.length]}`}
                            >
                              {user.initials}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-textPrimary dark:text-darkTextPrimary">
                                {user.name}
                              </p>
                              <p className="text-xs text-textSecondary dark:text-darkTextSecondary">
                                {user.role}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="flex flex-wrap gap-1">
                            {user.permissions.map((perm) => (
                              <code
                                key={perm}
                                className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700 dark:bg-darkBackground dark:text-darkTextSecondary"
                              >
                                {perm}
                              </code>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 pr-4">
                          {result ? (
                            result.allowed ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success dark:bg-darkSuccess/10 dark:text-darkSuccess">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Permitido
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger dark:bg-darkDanger/10 dark:text-darkDanger">
                                <XCircle className="h-3.5 w-3.5" />
                                Denegado por Deny Explícito
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-textSecondary/50 dark:text-darkTextSecondary/50">
                              No evaluado
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 pr-6 text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSimulate(user.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:bg-darkPrimary dark:hover:bg-darkPrimary/90"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronDown className="h-3.5 w-3.5 rotate-180 transition-transform" />
                                  Cerrar
                                </>
                              ) : (
                                <>
                                  <Play className="h-3.5 w-3.5" />
                                  Simular acceso
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && json && (
                        <tr>
                          <td colSpan={4} className="p-0">
                            <div className="mx-4 my-3 overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-darkBorder">
                              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-2 dark:border-darkBorder dark:bg-darkBackground">
                                <div className="flex items-center gap-2">
                                  <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                                  <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                                  <span className="h-2.5 w-2.5 rounded-full bg-success" />
                                  <span className="ml-2 font-mono text-xs text-textSecondary dark:text-darkTextSecondary">
                                    iam-policy-simulator.json
                                  </span>
                                </div>
                                <span className="font-mono text-[10px] text-textSecondary/60 dark:text-darkTextSecondary/60">
                                  Evaluado sobre {activeResource.permission} → {activeResource.label}
                                </span>
                              </div>
                              <pre className="max-h-72 overflow-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-400">
                                {json}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-3 text-xs text-textSecondary dark:text-darkTextSecondary">
          Simulación de acceso: <span className="font-mono">{activeResource.permission}</span> sobre{' '}
          <span className="font-mono">{activeResource.label}</span>. La evaluación respeta la jerarquía
          de permisos con comodines (<span className="font-mono">{'*'}</span>) y el precedente del
          Deny explícito sobre Allow.
        </p>
      </section>
    </div>
  )
}
