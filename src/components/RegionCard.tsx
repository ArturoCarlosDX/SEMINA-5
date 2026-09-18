import { useState } from 'react'
import { Boxes, ChevronDown, Layers, MapPin, Signal } from 'lucide-react'
import type { Region } from '../types/cloud'
import StatusBadge from './StatusBadge'

interface RegionCardProps {
  region: Region
}

export default function RegionCard({ region }: RegionCardProps) {
  const [expanded, setExpanded] = useState(false)

  const latencyTextColor =
    region.latencyMs < 50
      ? 'text-success dark:text-darkSuccess'
      : region.latencyMs <= 150
        ? 'text-warning dark:text-darkWarning'
        : 'text-danger dark:text-darkDanger'

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm dark:border-darkBorder dark:bg-darkCard">
      <button
        type="button"
        onClick={() => setExpanded((previous) => !previous)}
        className="flex w-full items-start justify-between gap-3 text-left focus:outline-none"
        aria-expanded={expanded}
      >
        <div>
          <h3 className="text-lg font-semibold text-textPrimary dark:text-darkTextPrimary">
            {region.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-textSecondary dark:text-darkTextSecondary">
            <MapPin className="h-4 w-4 shrink-0 text-textSecondary dark:text-darkTextSecondary" />
            {region.location}
          </p>
          <p
            className={`mt-2 flex items-center gap-1.5 text-sm font-semibold ${latencyTextColor}`}
          >
            <Signal className="h-4 w-4 shrink-0" />
            Latencia: {region.latencyMs} ms
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={region.status} />
          <ChevronDown
            className={`h-5 w-5 text-textSecondary transition-transform duration-300 dark:text-darkTextSecondary ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
          <Boxes className="h-4 w-4" />
          Servicios desplegados
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {region.deployedServices.map((serviceId) => (
            <span
              key={serviceId}
              className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary dark:bg-darkPrimary/10 dark:text-darkPrimary"
            >
              {serviceId}
            </span>
          ))}
        </div>
      </div>

      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mt-4 border-t border-border pt-4 dark:border-darkBorder">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-textSecondary dark:text-darkTextSecondary">
            <Layers className="h-4 w-4" />
            Zonas de disponibilidad ({region.availabilityZones.length})
          </p>
          <ul className="mt-2 space-y-2">
            {region.availabilityZones.map((zone) => (
              <li
                key={zone.name}
                className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2 dark:bg-darkBackground"
              >
                <span className="text-sm font-medium text-textPrimary dark:text-darkTextPrimary">
                  {zone.name}
                </span>
                <StatusBadge status={zone.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}