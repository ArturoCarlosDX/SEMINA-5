import { useState, type FormEvent } from 'react'
import { Calculator, Calendar, DollarSign, Gauge, Plus, Wallet } from 'lucide-react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import StatCard from '../components/StatCard'
import CostCard from '../components/CostCard'
import { useTheme } from '../hooks/useTheme'
import { costs as initialCosts } from '../data/costs'
import type { CostCategory, CostEnvironment, CostItem } from '../types/cloud'

const currency = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
})

const currency0 = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
})

const round = (value: number) => Math.round(value * 100) / 100

const HOURS_PER_MONTH = 730

const serviceCatalog: { name: string; unitCost: number; category: CostCategory }[] = [
  { name: 'EC2', unitCost: 120, category: 'Compute' },
  { name: 'S3', unitCost: 0.023, category: 'Storage' },
  { name: 'RDS', unitCost: 185, category: 'Database' },
  { name: 'CloudFront', unitCost: 95.5, category: 'Networking' },
  { name: 'Route 53', unitCost: 5, category: 'Networking' },
  { name: 'VPC (NAT Gateway)', unitCost: 45, category: 'Networking' }
]

function estimateCosts(quantity: number, hours: number, unitCost: number) {
  const monthlyCost = round(quantity * unitCost * (hours / HOURS_PER_MONTH))
  return {
    estimatedCost: monthlyCost,
    monthlyCost,
    annualCost: round(monthlyCost * 12)
  }
}

const LIGHT_CHART_COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626']
const DARK_CHART_COLORS = ['#3B82F6', '#22C55E', '#FBBF24', '#F87171']

const BUDGET_LIMIT = 1500

type Commitment = 'none' | '1y' | '3y'

const commitmentOptions: { value: Commitment; label: string; discount: number }[] = [
  { value: 'none', label: 'Sin compromiso', discount: 0 },
  { value: '1y', label: '1 año', discount: 20 },
  { value: '3y', label: '3 años', discount: 40 }
]

const commitmentIndex: Record<Commitment, number> = { none: 0, '1y': 1, '3y': 2 }

const environmentFilters: { value: 'all' | CostEnvironment; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'dev', label: 'Dev' },
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Producción' }
]

const categoryFilters: { value: 'all' | CostCategory; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'Compute', label: 'Compute' },
  { value: 'Storage', label: 'Storage' },
  { value: 'Database', label: 'Database' },
  { value: 'Networking', label: 'Networking' }
]

export default function Costs() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const textColor = isDark ? '#E5E7EB' : '#1E293B'
  const secondaryColor = isDark ? '#94A3B8' : '#64748B'
  const chartColors = isDark ? DARK_CHART_COLORS : LIGHT_CHART_COLORS
  const tooltipContentStyle = isDark
    ? { backgroundColor: '#111827', border: '1px solid #1E293B', borderRadius: '12px', color: '#E5E7EB' }
    : { backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#1E293B' }

  const [commitment, setCommitment] = useState<Commitment>('none')
  const [envFilter, setEnvFilter] = useState<'all' | CostEnvironment>('all')
  const [catFilter, setCatFilter] = useState<'all' | CostCategory>('all')
  const [items, setItems] = useState<CostItem[]>(initialCosts)
  const [serviceName, setServiceName] = useState(serviceCatalog[0].name)
  const [quantity, setQuantity] = useState('1')
  const [hours, setHours] = useState(String(HOURS_PER_MONTH))
  const [environment, setEnvironment] = useState<CostEnvironment>('production')

  const selectedService =
    serviceCatalog.find((service) => service.name === serviceName) ?? serviceCatalog[0]
  const quantityValue = Number(quantity)
  const hoursValue = Number(hours)
  const preview =
    quantityValue > 0 && hoursValue > 0
      ? estimateCosts(quantityValue, hoursValue, selectedService.unitCost)
      : null

  const activeCommitment =
    commitmentOptions.find((option) => option.value === commitment) ?? commitmentOptions[0]
  const multiplier = 1 - activeCommitment.discount / 100

  const baseMonthly = items.reduce((sum, item) => sum + item.monthlyCost, 0)
  const baseAnnual = items.reduce((sum, item) => sum + item.annualCost, 0)

  const discountedCosts = items.map((item) => ({
    ...item,
    monthlyCost: round(item.monthlyCost * multiplier),
    annualCost: round(item.annualCost * multiplier)
  }))

  const totalMonthly = discountedCosts.reduce((sum, item) => sum + item.monthlyCost, 0)
  const totalAnnual = discountedCosts.reduce((sum, item) => sum + item.annualCost, 0)
  const monthlySavings = round(baseMonthly - totalMonthly)
  const annualSavings = round(baseAnnual - totalAnnual)

  const chartData = discountedCosts.map((item) => ({
    name: item.service,
    value: item.monthlyCost
  }))

  const budgetPercent = Math.min(100, (totalMonthly / BUDGET_LIMIT) * 100)
  const budgetStatus = budgetPercent < 70 ? 'ok' : budgetPercent <= 90 ? 'warn' : 'danger'
  const budgetBarClasses = {
    ok: 'bg-success dark:bg-darkSuccess',
    warn: 'bg-warning dark:bg-darkWarning',
    danger: 'bg-danger dark:bg-darkDanger'
  }[budgetStatus]
  const budgetTextClasses = {
    ok: 'text-success dark:text-darkSuccess',
    warn: 'text-warning dark:text-darkWarning',
    danger: 'text-danger dark:text-darkDanger'
  }[budgetStatus]

  const filteredCosts = discountedCosts.filter(
    (item) =>
      (envFilter === 'all' || item.environment === envFilter) &&
      (catFilter === 'all' || item.category === catFilter)
  )
  const filteredMonthly = round(filteredCosts.reduce((sum, item) => sum + item.monthlyCost, 0))
  const filteredAnnual = round(filteredCosts.reduce((sum, item) => sum + item.annualCost, 0))

  const filterTabClass = (isActive: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
      isActive
        ? 'border-primary bg-primary text-white'
        : 'border-border bg-white text-textSecondary hover:bg-background hover:text-textPrimary dark:border-darkBorder dark:bg-darkCard dark:text-darkTextSecondary dark:hover:bg-darkBackground dark:hover:text-darkTextPrimary'
    }`

  function handleEstimate(event: FormEvent) {
    event.preventDefault()
    if (!preview) return

    const nextItem: CostItem = {
      id: selectedService.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      service: selectedService.name,
      quantity: quantityValue,
      estimatedHours: hoursValue,
      unitCost: selectedService.unitCost,
      monthlyCost: preview.monthlyCost,
      annualCost: preview.annualCost,
      category: selectedService.category,
      environment
    }

    setItems((previous) => {
      const index = previous.findIndex((item) => item.service === nextItem.service)
      if (index === -1) return [nextItem, ...previous]
      return previous.map((item, i) => (i === index ? { ...item, ...nextItem, id: item.id } : item))
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary dark:text-darkTextPrimary">Costos</h1>
        <p className="mt-2 text-textSecondary dark:text-darkTextSecondary">
          Estimación mensual y anual de los servicios desplegados.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:border-darkBorder dark:bg-darkCard">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-textPrimary dark:text-darkTextPrimary">
          <Calculator className="h-5 w-5 text-primary dark:text-darkPrimary" />
          Estimación simulada
        </h2>
        <p className="mt-1 text-sm text-textSecondary dark:text-darkTextSecondary">
          Selecciona un servicio, cantidad y horas para calcular el costo estimado.
        </p>

        <form onSubmit={handleEstimate} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
            Servicio
            <select
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-darkBorder dark:bg-darkBackground dark:text-darkTextPrimary"
            >
              {serviceCatalog.map((service) => (
                <option key={service.name} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
            Cantidad
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-darkBorder dark:bg-darkBackground dark:text-darkTextPrimary"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
            Horas estimadas
            <input
              type="number"
              min={1}
              max={HOURS_PER_MONTH}
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-darkBorder dark:bg-darkBackground dark:text-darkTextPrimary"
            />
          </label>
          <label className="text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
            Entorno
            <select
              value={environment}
              onChange={(event) => setEnvironment(event.target.value as CostEnvironment)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-darkBorder dark:bg-darkBackground dark:text-darkTextPrimary"
            >
              <option value="dev">Dev</option>
              <option value="staging">Staging</option>
              <option value="production">Producción</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={!preview}
            className="inline-flex items-center justify-center gap-2 self-end rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Aplicar estimación
          </button>
        </form>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-background p-4 dark:bg-darkBackground">
            <p className="text-xs text-textSecondary dark:text-darkTextSecondary">Costo estimado</p>
            <p className="mt-1 text-xl font-bold text-textPrimary dark:text-darkTextPrimary">
              {preview ? currency.format(preview.estimatedCost) : '—'}
            </p>
          </div>
          <div className="rounded-xl bg-background p-4 dark:bg-darkBackground">
            <p className="text-xs text-textSecondary dark:text-darkTextSecondary">Costo mensual</p>
            <p className="mt-1 text-xl font-bold text-textPrimary dark:text-darkTextPrimary">
              {preview ? currency.format(preview.monthlyCost) : '—'}
            </p>
          </div>
          <div className="rounded-xl bg-background p-4 dark:bg-darkBackground">
            <p className="text-xs text-textSecondary dark:text-darkTextSecondary">Costo anual</p>
            <p className="mt-1 text-xl font-bold text-textPrimary dark:text-darkTextPrimary">
              {preview ? currency.format(preview.annualCost) : '—'}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-textSecondary dark:text-darkTextSecondary">
          Fórmula simulada: cantidad × tarifa mensual × (horas / {HOURS_PER_MONTH}). El gráfico y las tarjetas se actualizan al aplicar.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:border-darkBorder dark:bg-darkCard">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-textPrimary dark:text-darkTextPrimary">
            <Wallet className="h-5 w-5 text-primary dark:text-darkPrimary" />
            Presupuesto mensual
          </h2>
          <span className={`text-2xl font-bold ${budgetTextClasses}`}>
            {budgetPercent.toFixed(0)}%
          </span>
        </div>
        <p className="mt-1 text-sm text-textSecondary dark:text-darkTextSecondary">
          Consumo del presupuesto configurado con el costo mensual actual.
        </p>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-background dark:bg-darkBackground">
          <div
            className={`h-full rounded-full transition-all duration-300 ${budgetBarClasses}`}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-semibold text-textPrimary dark:text-darkTextPrimary">
          {currency.format(totalMonthly)} consumidos de {currency.format(BUDGET_LIMIT)} / mes
        </p>
        <p className="mt-1 text-xs text-textSecondary dark:text-darkTextSecondary">
          Valor restante:{' '}
          {currency0.format(Math.max(0, BUDGET_LIMIT - totalMonthly))} ·{' '}
          {budgetPercent < 70
            ? 'Dentro del presupuesto'
            : budgetPercent <= 90
              ? 'Acercándose al límite'
              : 'Presupuesto excedido'}
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <StatCard
          title="Costo mensual total"
          value={currency.format(totalMonthly)}
          icon={DollarSign}
          trend={
            activeCommitment.discount > 0
              ? `Ahorra ${currency0.format(monthlySavings)}/mes`
              : '+4.2% vs mes anterior'
          }
        />
        <StatCard
          title="Costo anual total"
          value={currency.format(totalAnnual)}
          icon={Calendar}
          trend={
            activeCommitment.discount > 0
              ? `Ahorra ${currency0.format(annualSavings)}/año`
              : '-1.8% vs año anterior'
          }
        />
      </div>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:border-darkBorder dark:bg-darkCard">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-textPrimary dark:text-darkTextPrimary">
            <Gauge className="h-5 w-5 text-primary dark:text-darkPrimary" />
            Simulador de Saving Plans
          </h2>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary dark:bg-darkPrimary/10 dark:text-darkPrimary">
            {activeCommitment.discount}% de descuento
          </span>
        </div>
        <p className="mt-1 text-sm text-textSecondary dark:text-darkTextSecondary">
          Mueve el control hacia la derecha para comprometer el uso de tus recursos por más tiempo.
        </p>

        <div className="mt-6">
          <input
            type="range"
            min={0}
            max={commitmentOptions.length - 1}
            step={1}
            value={commitmentIndex[commitment]}
            onChange={(event) =>
              setCommitment(commitmentOptions[Number(event.target.value)].value)
            }
            aria-label="Compromiso de uso"
            className="w-full cursor-pointer accent-primary dark:accent-darkPrimary"
          />
          <div className="mt-2 flex justify-between">
            {commitmentOptions.map((option) => {
              const isActive = option.value === commitment
              return (
                <span
                  key={option.value}
                  className={`text-center text-xs font-semibold ${isActive ? 'text-primary dark:text-darkPrimary' : 'text-textSecondary dark:text-darkTextSecondary'}`}
                >
                  {option.label}
                  <span className="block font-normal">{option.discount}% descuento</span>
                </span>
              )
            })}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-background p-4 dark:bg-darkBackground">
            <p className="text-xs text-textSecondary dark:text-darkTextSecondary">Costo mensual</p>
            <p className="mt-1 text-2xl font-bold text-textPrimary dark:text-darkTextPrimary">
              {currency.format(totalMonthly)}
            </p>
            {activeCommitment.discount > 0 ? (
              <p className="mt-1 text-xs font-semibold text-success dark:text-darkSuccess">
                Ahorro de {currency0.format(monthlySavings)} / mes
              </p>
            ) : (
              <p className="mt-1 text-xs text-textSecondary dark:text-darkTextSecondary">
                Sin descuento aplicado
              </p>
            )}
          </div>
          <div className="rounded-xl bg-background p-4 dark:bg-darkBackground">
            <p className="text-xs text-textSecondary dark:text-darkTextSecondary">Costo anual</p>
            <p className="mt-1 text-2xl font-bold text-textPrimary dark:text-darkTextPrimary">
              {currency.format(totalAnnual)}
            </p>
            {activeCommitment.discount > 0 ? (
              <p className="mt-1 text-xs font-semibold text-success dark:text-darkSuccess">
                Ahorro de {currency0.format(annualSavings)} / año
              </p>
            ) : (
              <p className="mt-1 text-xs text-textSecondary dark:text-darkTextSecondary">
                Sin descuento aplicado
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
              Entorno
            </span>
            {environmentFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setEnvFilter(filter.value)}
                className={filterTabClass(envFilter === filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
              Categoría
            </span>
            {categoryFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setCatFilter(filter.value)}
                className={filterTabClass(catFilter === filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-textSecondary dark:text-darkTextSecondary">
            Mostrando {filteredCosts.length} de {discountedCosts.length} servicios
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="font-semibold text-textPrimary dark:text-darkTextPrimary">
              Subtotal mensual:{' '}
              <span className="text-primary dark:text-darkPrimary">
                {currency0.format(filteredMonthly)}
              </span>
            </span>
            <span className="font-semibold text-textPrimary dark:text-darkTextPrimary">
              Subtotal anual:{' '}
              <span className="text-primary dark:text-darkPrimary">
                {currency0.format(filteredAnnual)}
              </span>
            </span>
          </div>
        </div>

        {filteredCosts.length === 0 ? (
          <p className="rounded-2xl border border-border bg-white p-6 text-center text-textSecondary dark:border-darkBorder dark:bg-darkCard dark:text-darkTextSecondary">
            No hay servicios que coincidan con los filtros seleccionados.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {filteredCosts.map((item) => (
              <CostCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:border-darkBorder dark:bg-darkCard">
        <h2 className="text-lg font-semibold text-textPrimary dark:text-darkTextPrimary">
          Distribución del costo mensual
        </h2>
        <p className="mt-1 text-sm text-textSecondary dark:text-darkTextSecondary">
          Costo mensual por servicio en USD, con el compromiso seleccionado.
        </p>
        <div className="mt-4 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={{ color: secondaryColor }}
                formatter={(value) => currency.format(Number(value))}
              />
              <Legend
                wrapperStyle={{ color: secondaryColor }}
                formatter={(value) => <span style={{ color: textColor }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}