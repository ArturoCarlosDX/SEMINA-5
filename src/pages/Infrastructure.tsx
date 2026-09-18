import RegionCard from '../components/RegionCard'
import { regions } from '../data/regions'

export default function Infrastructure() {
  const operationalCount = regions.filter((region) => region.status === 'operational').length

  return (
    <div>
      <h1 className="text-2xl font-bold text-textPrimary dark:text-darkTextPrimary">
        Infraestructura Global
      </h1>
      <p className="mt-2 text-textSecondary dark:text-darkTextSecondary">
        {operationalCount} de {regions.length} regiones operativas
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-textSecondary dark:text-darkTextSecondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-success dark:bg-darkSuccess" />
          Latencia baja (&lt; 50 ms)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-warning dark:bg-darkWarning" />
          Latencia media (50–150 ms)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger dark:bg-darkDanger" />
          Latencia alta (&gt; 150 ms)
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {regions.map((region) => (
          <RegionCard key={region.id} region={region} />
        ))}
      </div>
    </div>
  )
}