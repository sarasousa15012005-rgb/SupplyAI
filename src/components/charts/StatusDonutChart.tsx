import { formatNumber } from '@/lib/inventory';

interface StatusDonutChartProps {
  normalCount: number;
  replenishmentCount: number;
}

const RADIUS = 70;
const STROKE = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function StatusDonutChart({ normalCount, replenishmentCount }: StatusDonutChartProps) {
  const total = normalCount + replenishmentCount;
  const replenishmentLength = total > 0 ? (replenishmentCount / total) * CIRCUMFERENCE : 0;
  const normalLength = total > 0 ? (normalCount / total) * CIRCUMFERENCE : 0;
  const replenishmentShare = total > 0 ? Math.round((replenishmentCount / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-48 w-48 shrink-0">
        <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" role="img" aria-label={`${replenishmentShare}% dos produtos precisam de reposição`}>
          <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#F1F5F9" strokeWidth={STROKE} />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#E11D48"
            strokeWidth={STROKE}
            strokeDasharray={`${replenishmentLength} ${CIRCUMFERENCE}`}
            className="transition-all duration-700 ease-out"
          />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#16A34A"
            strokeWidth={STROKE}
            strokeDasharray={`${normalLength} ${CIRCUMFERENCE}`}
            strokeDashoffset={-replenishmentLength}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-navy-900">{replenishmentShare}%</span>
          <span className="text-xs text-slate-500">precisam de reposição</span>
        </div>
      </div>

      <ul className="w-full space-y-4 sm:w-auto">
        <li className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-rose-600" />
          <div>
            <p className="text-sm font-medium text-slate-700">Reposição necessária</p>
            <p className="text-xs text-slate-500">{formatNumber(replenishmentCount)} produtos</p>
          </div>
        </li>
        <li className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-green-600" />
          <div>
            <p className="text-sm font-medium text-slate-700">Estoque normal</p>
            <p className="text-xs text-slate-500">{formatNumber(normalCount)} produtos</p>
          </div>
        </li>
      </ul>
    </div>
  );
}
