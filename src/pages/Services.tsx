import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import ServiceCard from '../components/ServiceCard'
import ServiceDetailModal from '../components/ServiceDetailModal'
import { awsServices } from '../data/awsServices'
import type { Service } from '../types/cloud'

const categoryLabels: Record<string, string> = {
  Compute: 'Cómputo',
  Storage: 'Almacenamiento',
  Database: 'Bases de Datos',
  Networking: 'Redes',
  Security: 'Seguridad',
  DNS: 'DNS',
  CDN: 'CDN'
}

const categoryOrder = ['Compute', 'Storage', 'Database', 'Networking', 'Security', 'DNS', 'CDN']

export default function Services() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return awsServices.filter((service) => {
      const matchesName =
        service.name.toLowerCase().includes(normalizedQuery) ||
        service.description.toLowerCase().includes(normalizedQuery)
      const matchesCategory = category === 'all' || service.category === category
      return matchesName && matchesCategory
    })
  }, [query, category])

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary dark:text-darkTextPrimary">
            Servicios AWS
          </h1>
          <p className="mt-2 text-textSecondary dark:text-darkTextSecondary">
            {filteredServices.length} servicio{filteredServices.length !== 1 && 's'} encontrado
            {filteredServices.length !== 1 && 's'}
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary dark:text-darkTextSecondary" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-8 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-darkBorder dark:bg-darkCard dark:text-darkTextPrimary dark:placeholder:text-darkTextSecondary dark:focus:border-darkPrimary dark:focus:ring-darkPrimary/20 sm:w-64"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-textSecondary hover:text-danger dark:text-darkTextSecondary dark:hover:text-darkDanger"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
            category === 'all'
              ? 'border-primary bg-primary text-white'
              : 'border-border bg-white text-textSecondary hover:bg-background hover:text-textPrimary dark:border-darkBorder dark:bg-darkCard dark:text-darkTextSecondary dark:hover:bg-darkBackground dark:hover:text-darkTextPrimary'
          }`}
        >
          Todos
        </button>
        {categoryOrder.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setCategory(key)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              category === key
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-white text-textSecondary hover:bg-background hover:text-textPrimary dark:border-darkBorder dark:bg-darkCard dark:text-darkTextSecondary dark:hover:bg-darkBackground dark:hover:text-darkTextPrimary'
            }`}
          >
            {categoryLabels[key] ?? key}
          </button>
        ))}
      </div>

      {filteredServices.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={setSelectedService}
            />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl border border-border bg-white p-6 text-center text-textSecondary dark:border-darkBorder dark:bg-darkCard dark:text-darkTextSecondary">
          No se encontraron servicios con los filtros seleccionados.
        </p>
      )}

      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  )
}