import { useMemo } from 'react';
import { CalendarClock, Gauge, PackageMinus, TrendingDown, Warehouse } from 'lucide-react';
import KpiCard from '@/components/KpiCard';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { formatDays, formatNumber } from '@/lib/inventory';
import type { InventorySummary, ProductAnalysis } from '@/types/inventory';

interface ReportsPageProps {
  items: ProductAnalysis[];
  summary: InventorySummary;
}

interface Highlight {
  label: string;
  item: ProductAnalysis | undefined;
  value: string;
}

export default function ReportsPage({ items, summary }: ReportsPageProps) {
  const rankedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => (a.coverageDays ?? Number.POSITIVE_INFINITY) - (b.coverageDays ?? Number.POSITIVE_INFINITY),
      ),
    [items],
  );

  const highlights: Highlight[] = useMemo(() => {
    const withCoverage = items.filter((item) => item.coverageDays !== null);
    const lowestCoverage = withCoverage.reduce<ProductAnalysis | undefined>(
      (lowest, item) => (!lowest || (item.coverageDays ?? 0) < (lowest.coverageDays ?? 0) ? item : lowest),
      undefined,
    );
    const highestConsumption = items.reduce<ProductAnalysis | undefined>(
      (top, item) => (!top || item.dailyConsumption > top.dailyConsumption ? item : top),
      undefined,
    );
    const largestShortfall = items.reduce<ProductAnalysis | undefined>(
      (top, item) => (!top || item.shortfallToReorderPoint > top.shortfallToReorderPoint ? item : top),
      undefined,
    );

    return [
      {
        label: 'Menor cobertura',
        item: lowestCoverage,
        value: formatDays(lowestCoverage?.coverageDays ?? null),
      },
      {
        label: 'Maior consumo diário',
        item: highestConsumption,
        value: `${formatNumber(highestConsumption?.dailyConsumption ?? 0)} por dia`,
      },
      {
        label: 'Maior falta para o pedido',
        item: largestShortfall,
        value: `${formatNumber(largestShortfall?.shortfallToReorderPoint ?? 0)} unidades`,
      },
    ];
  }, [items]);

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Indicadores gerenciais e ranking de cobertura dos seus estoques."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Unidades em estoque"
          value={formatNumber(summary.totalStock)}
          hint="Soma do estoque atual de todos os produtos"
          icon={Warehouse}
          tone="navy"
        />
        <KpiCard
          label="Consumo diário total"
          value={formatNumber(summary.totalDailyConsumption)}
          hint="Unidades consumidas por dia, somando todos os itens"
          icon={TrendingDown}
          tone="green"
        />
        <KpiCard
          label="Unidades abaixo do pedido"
          value={formatNumber(summary.totalShortfall)}
          hint="Quanto falta para atingir o ponto de pedido"
          icon={PackageMinus}
          tone="rose"
        />
        <KpiCard
          label="Cobertura média"
          value={formatDays(summary.averageCoverageDays)}
          hint="Média simples da cobertura de cada produto"
          icon={Gauge}
          tone="amber"
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {highlights.map((highlight) => (
          <div
            key={highlight.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <CalendarClock className="h-4 w-4" />
              {highlight.label}
            </div>
            <p className="mt-3 text-lg font-semibold text-navy-900">{highlight.item?.name ?? 'Sem dados'}</p>
            <p className="mt-1 text-sm text-slate-500">{highlight.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-base font-semibold text-navy-900">Ranking por cobertura</h2>
          <p className="mt-1 text-sm text-slate-500">Do produto com menos dias de estoque para o com mais</p>
        </div>
        <div className="overflow-x-auto p-2 sm:p-3">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-3 py-3">Produto</th>
                <th className="px-3 py-3 text-right">Estoque</th>
                <th className="px-3 py-3 text-right">Cobertura</th>
                <th className="px-3 py-3 text-right">Ponto de pedido</th>
                <th className="px-3 py-3 text-right">Falta para o pedido</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rankedItems.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-slate-50">
                  <td className="border-t border-slate-100 px-3 py-4 font-medium text-navy-900">{item.name}</td>
                  <td className="border-t border-slate-100 px-3 py-4 text-right tabular-nums text-slate-700">
                    {formatNumber(item.currentStock)}
                  </td>
                  <td className="border-t border-slate-100 px-3 py-4 text-right tabular-nums text-slate-700">
                    {formatDays(item.coverageDays)}
                  </td>
                  <td className="border-t border-slate-100 px-3 py-4 text-right tabular-nums text-slate-700">
                    {formatNumber(item.reorderPoint)}
                  </td>
                  <td className="border-t border-slate-100 px-3 py-4 text-right tabular-nums text-slate-700">
                    {formatNumber(item.shortfallToReorderPoint)}
                  </td>
                  <td className="border-t border-slate-100 px-3 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
