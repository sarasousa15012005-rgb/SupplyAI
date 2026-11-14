import { formatDays } from '@/lib/inventory';
import type { ProductAnalysis } from '@/types/inventory';

interface CoverageBarChartProps {
  items: ProductAnalysis[];
}

export default function CoverageBarChart({ items }: CoverageBarChartProps) {
  const maxCoverage = Math.max(1, ...items.map((item) => item.coverageDays ?? 0));

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const isReplenishment = item.status === 'reposicao';
        const width = item.coverageDays === null ? 0 : (item.coverageDays / maxCoverage) * 100;
        return (
          <li key={item.id} className="group">
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700 transition group-hover:text-navy-900">{item.name}</span>
              <span className="text-xs font-medium text-slate-500">{formatDays(item.coverageDays)}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out group-hover:brightness-110 ${
                  isReplenishment ? 'bg-rose-500' : 'bg-green-500'
                }`}
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
