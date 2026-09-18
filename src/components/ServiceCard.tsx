import { Eye, Wrench } from 'lucide-react'
import type { Service } from '../types/cloud'
import StatusBadge from './StatusBadge'

interface ServiceCardProps {
  service: Service
  onSelect?: (service: Service) => void
}

export default function ServiceCard({ service, onSelect }: ServiceCardProps) {
  function handleClick() {
    onSelect?.(service)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect?.(service)
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`Ver detalles de ${service.name}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="flex cursor-pointer flex-col rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-primary/10 dark:border-darkBorder dark:bg-darkCard dark:hover:ring-darkPrimary/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-textPrimary dark:text-darkTextPrimary">
            {service.name}
          </h3>
          <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary dark:bg-darkPrimary/10 dark:text-darkPrimary">
            {service.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={service.status} />
          <Eye className="h-4 w-4 shrink-0 text-textSecondary dark:text-darkTextSecondary" aria-hidden="true" />
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-textSecondary dark:text-darkTextSecondary">
        {service.description}
      </p>

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-background p-3 text-sm text-textPrimary dark:bg-darkBackground dark:text-darkTextPrimary">
        <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-primary dark:text-darkPrimary" />
        <p>
          <span className="font-semibold">Función principal: </span>
          {service.mainFunction}
        </p>
      </div>
    </article>
  )
}