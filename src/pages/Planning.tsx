import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Columns, Download, Lightbulb, Plus, Trash2 } from 'lucide-react'
import type { CloudProposal, ProposalStatus } from '../types/cloud'
import { awsServices } from '../data/awsServices'
import { regions } from '../data/regions'

const STORAGE_KEY = 'cloudops-proposals'

const currency = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
})

const availabilityOptions = [
  { value: 'basica', label: 'Básica', sla: '99.9%' },
  { value: 'alta', label: 'Alta', sla: '99.99%' },
  { value: 'critica', label: 'Crítica', sla: '99.999%' }
]

const availabilityStyles: Record<string, string> = {
  basica: 'bg-success/10 text-success dark:bg-darkSuccess/10 dark:text-darkSuccess',
  alta: 'bg-warning/10 text-warning dark:bg-darkWarning/10 dark:text-darkWarning',
  critica: 'bg-danger/10 text-danger dark:bg-darkDanger/10 dark:text-darkDanger'
}

const statusOptions: { value: ProposalStatus; label: string }[] = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'en_revision', label: 'En revisión' },
  { value: 'aprobada', label: 'Aprobada' }
]

const statusStyles: Record<ProposalStatus, string> = {
  borrador:
    'bg-textSecondary/10 text-textSecondary dark:bg-darkTextSecondary/10 dark:text-darkTextSecondary',
  en_revision: 'bg-warning/10 text-warning dark:bg-darkWarning/10 dark:text-darkWarning',
  aprobada: 'bg-success/10 text-success dark:bg-darkSuccess/10 dark:text-darkSuccess'
}

type StatusFilter = 'todas' | ProposalStatus

interface FormState {
  solutionName: string
  appType: string
  description: string
  region: string
  estimatedUsers: string
  availabilityLevel: string
  selectedServices: string[]
  migrationGoal: string
  status: ProposalStatus
}

const emptyForm: FormState = {
  solutionName: '',
  appType: '',
  description: '',
  region: '',
  estimatedUsers: '',
  availabilityLevel: '',
  selectedServices: [],
  migrationGoal: '',
  status: 'borrador'
}

const initialProposals: CloudProposal[] = [
  {
    id: 'prop-seed-1',
    solutionName: 'E-Commerce Multirregión',
    appType: 'Web / API',
    description: 'Tienda en línea con catálogo, pasarela de pagos y panel de administración replicado en varias regiones.',
    region: 'sa-east-1',
    estimatedUsers: 50000,
    availabilityLevel: 'alta',
    selectedServices: ['ec2', 'rds', 's3', 'cloudfront', 'route53'],
    migrationGoal: 'Atender picos de tráfico regionales manteniendo latencia baja en Sudamérica.',
    status: 'aprobada'
  },
  {
    id: 'prop-seed-2',
    solutionName: 'Portal Académico SENATI',
    appType: 'Web',
    description: 'Portal de gestión académica con matrículas, notas y aula virtual para alumnos y docentes.',
    region: 'us-east-1',
    estimatedUsers: 12000,
    availabilityLevel: 'alta',
    selectedServices: ['ec2', 'rds', 'vpc'],
    migrationGoal: 'Centralizar la información académica y reducir el mantenimiento del servidor local.',
    status: 'en_revision'
  },
  {
    id: 'prop-seed-3',
    solutionName: 'Sistema de Telemetría IoT',
    appType: 'Microservicios',
    description: 'Ingesta y procesamiento de lecturas de sensores industriales con almacenamiento histórico.',
    region: 'us-east-1',
    estimatedUsers: 100000,
    availabilityLevel: 'critica',
    selectedServices: ['ec2', 's3', 'iam', 'vpc'],
    migrationGoal: 'Escalar horizontalmente la ingesta de datos con tolerancia a fallos crítica.',
    status: 'aprobada'
  },
  {
    id: 'prop-seed-4',
    solutionName: 'App Móvil Delivery',
    appType: 'Móvil',
    description: 'Aplicación de reparto a domicilio con seguimiento de pedidos en tiempo real y contenido estático.',
    region: 'sa-east-1',
    estimatedUsers: 25000,
    availabilityLevel: 'alta',
    selectedServices: ['s3', 'cloudfront', 'route53', 'iam'],
    migrationGoal: 'Distribuir assets con baja latencia y asegurar el acceso de los usuarios móviles.',
    status: 'borrador'
  },
  {
    id: 'prop-seed-5',
    solutionName: 'Plataforma Core Bancaria',
    appType: 'Enterprise',
    description: 'Núcleo transaccional bancario con aislamiento de red, auditoría de accesos y base de datos relacional.',
    region: 'eu-west-1',
    estimatedUsers: 8000,
    availabilityLevel: 'critica',
    selectedServices: ['ec2', 'rds', 'iam', 'vpc', 'route53'],
    migrationGoal: 'Cumplir requisitos regulatorios con alta disponibilidad y trazabilidad completa.',
    status: 'en_revision'
  }
]

type FormErrors = Partial<Record<keyof FormState, string>>

const inputClass = 'w-full rounded-md border border-border bg-white px-3 py-1.5 text-xs text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-darkBorder dark:bg-darkCard dark:text-darkTextPrimary dark:placeholder:text-darkTextSecondary dark:focus:ring-darkPrimary/20'
const labelClass = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary'

function fieldClass(hasError: boolean) {
  return `${inputClass} ${hasError ? 'border-danger dark:border-darkDanger' : 'border-border dark:border-darkBorder'}`
}

function regionName(id: string) {
  return regions.find((region) => region.id === id)?.name ?? id
}

function serviceName(id: string) {
  return awsServices.find((service) => service.id === id)?.name ?? id.toUpperCase()
}

function availabilitySla(value: string) {
  return availabilityOptions.find((option) => option.value === value)?.sla ?? '—'
}

function statusLabel(value: ProposalStatus) {
  return statusOptions.find((option) => option.value === value)?.label ?? value
}

function suggestArchitecture(appType: string, estimatedUsers: number, availabilityLevel: string) {
  if (!appType || !Number.isFinite(estimatedUsers) || estimatedUsers <= 0 || !availabilityLevel) return null
  const isMobile = appType.toLowerCase().includes('movil') || appType.toLowerCase().includes('mobile')
  const isApi = appType.toLowerCase().includes('api')
  let stack = isApi ? ['API Gateway', 'Lambda', 'DynamoDB'] : isMobile ? ['CloudFront', 'S3', 'API Gateway'] : ['CloudFront', 'S3', 'EC2', 'RDS']
  const multiplier = availabilityLevel === 'critica' ? 1.8 : availabilityLevel === 'alta' ? 1.3 : 1
  const baseCosts: Record<string, number> = { EC2: 220, S3: 40, RDS: 180, CloudFront: 90, 'API Gateway': 70, Lambda: 60, DynamoDB: 80 }
  const baseCost = stack.reduce((sum, s) => sum + (baseCosts[s] ?? 100), 0)
  const estimatedCost = Math.round((baseCost + estimatedUsers * 0.01) * multiplier)
  return { architecture: stack.join(' + '), services: stack, estimatedCost, rationale: `Arquitectura sugerida para ${estimatedUsers.toLocaleString('es-ES')} usuarios.` }
}

export default function Planning() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [proposals, setProposals] = useState<CloudProposal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return initialProposals
      const parsed = JSON.parse(saved) as CloudProposal[]
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialProposals
    } catch {
      return initialProposals
    }
  })

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas')
  const [compareMode, setCompareMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [detailId, setDetailId] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals))
  }, [proposals])

  const suggestion = useMemo(() => suggestArchitecture(form.appType, Number(form.estimatedUsers), form.availabilityLevel), [form])

  const filteredProposals = useMemo(() => proposals.filter((p) => statusFilter === 'todas' || p.status === statusFilter), [proposals, statusFilter])

  const filterCounts = useMemo(() => ({
    todas: proposals.length,
    borrador: proposals.filter((p) => p.status === 'borrador').length,
    en_revision: proposals.filter((p) => p.status === 'en_revision').length,
    aprobada: proposals.filter((p) => p.status === 'aprobada').length
  }), [proposals])

  const filterTabs: { value: StatusFilter; label: string }[] = [
    { value: 'todas', label: 'Todas' },
    ...statusOptions.map((o) => ({ value: o.value as StatusFilter, label: o.label }))
  ]

  const selectedProposals = useMemo(
    () => proposals.filter((proposal) => selectedIds.includes(proposal.id)),
    [proposals, selectedIds]
  )

  const detailProposal = proposals.find((p) => p.id === detailId) ?? null
  const detailSuggestion = detailProposal ? suggestArchitecture(detailProposal.appType, detailProposal.estimatedUsers, detailProposal.availabilityLevel) : null

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'status' ? (value as ProposalStatus) : value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleServiceToggle(id: string) {
    setForm((prev) => ({ ...prev, selectedServices: prev.selectedServices.includes(id) ? prev.selectedServices.filter((s) => s !== id) : [...prev.selectedServices, id] }))
  }

  function validate(cur: FormState) {
    const next: FormErrors = {}
    if (!cur.solutionName.trim()) next.solutionName = 'Ingresa el nombre.'
    if (!cur.appType.trim()) next.appType = 'Ingresa el tipo.'
    if (!cur.description.trim()) next.description = 'Describe la solución.'
    if (!cur.region) next.region = 'Selecciona región.'
    if (!cur.estimatedUsers || Number(cur.estimatedUsers) <= 0) next.estimatedUsers = 'Ingresa usuarios.'
    if (cur.selectedServices.length === 0) next.selectedServices = 'Selecciona al menos un servicio.'
    if (!cur.migrationGoal.trim()) next.migrationGoal = 'Describe objetivo.'
    return next
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length > 0) { setErrors(nextErrors); return }
    const proposal: CloudProposal = { id: `prop-${Date.now()}`, solutionName: form.solutionName.trim(), appType: form.appType.trim(), description: form.description.trim(), region: form.region, estimatedUsers: Number(form.estimatedUsers), availabilityLevel: form.availabilityLevel, selectedServices: form.selectedServices, migrationGoal: form.migrationGoal.trim(), status: form.status }
    setProposals((prev) => [proposal, ...prev])
    setForm(emptyForm)
    setErrors({})
  }

  function handleRemove(id: string) {
    setProposals((prev) => prev.filter((p) => p.id !== id))
    setSelectedIds((prev) => prev.filter((s) => s !== id))
    setDetailId((prev) => (prev === id ? null : prev))
  }

  function handleToggleCompareMode() { setCompareMode((p) => !p); setSelectedIds([]) }
  function handleToggleCompare(id: string) { setSelectedIds((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : prev.length >= 2 ? prev : [...prev, id]) }

  const comparisonRows: { label: string; value: (p: CloudProposal) => ReactNode }[] = [
    { label: 'Estado', value: (p) => <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[p.status]}`}>{statusLabel(p.status)}</span> },
    { label: 'Tipo', value: (p) => p.appType },
    { label: 'Región', value: (p) => regionName(p.region) },
    { label: 'Usuarios', value: (p) => p.estimatedUsers.toLocaleString('es-PE') },
    { label: 'Servicios', value: (p) => <div className="flex flex-wrap gap-1.5">{p.selectedServices.map((s) => <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary dark:bg-darkPrimary/10 dark:text-darkPrimary">{serviceName(s)}</span>)}</div> },
    { label: 'Descripción', value: (p) => p.description }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-textPrimary dark:text-darkTextPrimary">Planificación Cloud</h1>
        <p className="mt-2 text-textSecondary dark:text-darkTextSecondary">Define propuestas de arquitectura cloud y regístralas para su evaluación.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4">
          <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border bg-white p-5 shadow-sm dark:border-darkBorder dark:bg-darkCard">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Nombre</label>
                <input name="solutionName" value={form.solutionName} onChange={handleChange} className={fieldClass(Boolean(errors.solutionName))} placeholder="Ej. Plataforma de e-commerce" />
              </div>
              <div>
                <label className={labelClass}>Tipo</label>
                <input name="appType" value={form.appType} onChange={handleChange} className={fieldClass(Boolean(errors.appType))} placeholder="Ej. Web / API / Móvil" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Región</label>
                <select name="region" value={form.region} onChange={handleChange} className={fieldClass(Boolean(errors.region))}>
                  <option value="">Selecciona una región</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Usuarios</label>
                <input name="estimatedUsers" type="number" min={1} value={form.estimatedUsers} onChange={handleChange} className={fieldClass(Boolean(errors.estimatedUsers))} placeholder="Ej. 5000" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Descripción</label>
              <textarea name="description" rows={2} value={form.description} onChange={handleChange} className={fieldClass(Boolean(errors.description))} placeholder="Describe la solución y su propósito." />
            </div>

            <div>
              <label className={labelClass}>Objetivo</label>
              <textarea name="migrationGoal" rows={2} value={form.migrationGoal} onChange={handleChange} className={fieldClass(Boolean(errors.migrationGoal))} placeholder="Ej. Reducir costos y mejorar la disponibilidad global." />
            </div>

            <div>
              <label className={labelClass}>Servicios Cloud</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {awsServices.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 rounded-md border border-border bg-white px-2 py-1 text-xs text-textPrimary dark:border-darkBorder dark:bg-darkCard dark:text-darkTextPrimary">
                    <input type="checkbox" checked={form.selectedServices.includes(s.id)} onChange={() => handleServiceToggle(s.id)} className="h-4 w-4 accent-primary" />
                    <span className="truncate">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <select name="availabilityLevel" value={form.availabilityLevel} onChange={handleChange} className={fieldClass(Boolean(errors.availabilityLevel))}>
                <option value="">Disponibilidad</option>
                {availabilityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select name="status" value={form.status} onChange={handleChange} className={fieldClass(false)}>
                {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white">
              <Plus className="h-4 w-4" /> Registrar propuesta
            </button>
          </form>

          {suggestion && (
            <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-textPrimary shadow-sm dark:border-darkPrimary/40 dark:bg-darkCard dark:text-darkTextPrimary">
              <div className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary dark:text-darkPrimary" /> Arquitectura sugerida</div>
              <p className="mt-2 font-semibold">{suggestion.architecture}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">{suggestion.services.map((s) => <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary dark:bg-darkPrimary/10 dark:text-darkPrimary">{s}</span>)}</div>
              <p className="mt-2 text-xs text-textSecondary dark:text-darkTextSecondary">{suggestion.rationale}</p>
              <p className="mt-2 font-bold">{currency.format(suggestion.estimatedCost)} / mes</p>
            </div>
          )}
        </aside>

        <main className="lg:col-span-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Propuestas registradas ({proposals.length})</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                {filterTabs.map((tab) => (
                  <button key={tab.value} onClick={() => setStatusFilter(tab.value)} className={`rounded-full border px-3 py-1 text-xs text-textPrimary transition-colors dark:text-darkTextPrimary ${statusFilter === tab.value ? 'border-primary bg-primary text-white dark:border-darkPrimary dark:bg-darkPrimary' : 'border-border bg-white dark:border-darkBorder dark:bg-darkCard'}`}>{tab.label} ({filterCounts[tab.value]})</button>
                ))}
              </div>
              <button onClick={handleToggleCompareMode} className="ml-2 inline-flex items-center gap-2 rounded-md border border-border bg-white px-3 py-1 text-xs text-textPrimary shadow-sm dark:border-darkBorder dark:bg-darkCard dark:text-darkTextPrimary"><Columns className="h-4 w-4" /> Comparar</button>
            </div>
          </div>

          {compareMode && selectedProposals.length === 2 && (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-white p-3 shadow-sm dark:border-darkBorder dark:bg-darkCard">
              <table className="min-w-full text-left text-xs text-textPrimary dark:text-darkTextPrimary">
                <thead>
                  <tr>
                    <th className="px-2 py-2 font-semibold">Campo</th>
                    {selectedProposals.map((proposal) => (
                      <th key={proposal.id} className="px-2 py-2 font-semibold">{proposal.solutionName}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="border-t border-border dark:border-darkBorder">
                      <td className="px-2 py-2 font-medium text-textSecondary dark:text-darkTextSecondary">{row.label}</td>
                      {selectedProposals.map((proposal) => (
                        <td key={`${proposal.id}-${row.label}`} className="px-2 py-2 align-top">{row.value(proposal)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {detailProposal && (
            <section className="mt-4 rounded-2xl border border-border bg-white p-4 shadow-sm dark:border-darkBorder dark:bg-darkCard">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{detailProposal.solutionName}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs">{detailProposal.appType}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusStyles[detailProposal.status]}`}>{statusLabel(detailProposal.status)}</span>
                  </div>
                </div>
                <div>
                  <button onClick={() => setDetailId(null)} className="text-xs">Cerrar</button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>Región: <strong className="font-semibold">{regionName(detailProposal.region)}</strong></div>
                <div>Usuarios: <strong className="font-semibold">{detailProposal.estimatedUsers.toLocaleString('es-ES')}</strong></div>
                <div>Disponibilidad: <strong className="font-semibold">{availabilitySla(detailProposal.availabilityLevel)}</strong></div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">{detailProposal.selectedServices.map((s) => <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary dark:bg-darkPrimary/10 dark:text-darkPrimary">{serviceName(s)}</span>)}</div>

              {detailSuggestion && <div className="mt-3 rounded-md border border-border bg-background p-3 text-sm text-textPrimary dark:border-darkBorder dark:bg-darkCard dark:text-darkTextPrimary">Arquitectura recomendada: <strong>{detailSuggestion.architecture}</strong> — {currency.format(detailSuggestion.estimatedCost)} / mes</div>}
            </section>
          )}

          <div className="mt-4 max-h-[560px] overflow-y-auto space-y-3">
            {filteredProposals.map((p) => (
              <article key={p.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm dark:border-darkBorder dark:bg-darkCard">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold text-sm text-textPrimary dark:text-darkTextPrimary">{p.solutionName}</h4>
                      {compareMode && (
                        <label className="inline-flex items-center gap-2 text-[11px] text-textSecondary dark:text-darkTextSecondary">
                          <input type="checkbox" checked={selectedIds.includes(p.id)} disabled={!selectedIds.includes(p.id) && selectedIds.length >= 2} onChange={() => handleToggleCompare(p.id)} className="h-4 w-4 accent-primary" />
                          Compare
                        </label>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-textSecondary dark:text-darkTextSecondary">
                      <span>{p.appType}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusStyles[p.status]}`}>{statusLabel(p.status)}</span>
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-textSecondary dark:text-darkTextSecondary">
                      <div>Región: <span className="font-semibold text-textPrimary dark:text-darkTextPrimary">{regionName(p.region)}</span></div>
                      <div>Usuarios: <span className="font-semibold">{p.estimatedUsers.toLocaleString('es-PE')}</span></div>
                      <div>Disponibilidad: <span className="font-semibold">{availabilitySla(p.availabilityLevel)}</span></div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">{p.selectedServices.map((s) => <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary dark:bg-darkPrimary/10 dark:text-darkPrimary">{serviceName(s)}</span>)}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    <button onClick={() => setDetailId(p.id)} className="text-xs text-textPrimary underline dark:text-darkTextPrimary">Ver detalles</button>
                    <div className="flex gap-2">
                      <button onClick={() => { const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `propuesta-${p.solutionName.replace(/[^a-z0-9]+/gi, '-')}.json`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); }} className="text-xs text-textPrimary dark:text-darkTextPrimary">Exportar</button>
                      <button onClick={() => handleRemove(p.id)} className="text-xs text-danger dark:text-darkDanger">Eliminar</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
