import { AlertTriangle, Boxes, Gauge, PackageCheck } from 'lucide-react';
import KpiCard from '@/components/KpiCard';
import PageHeader from '@/components/PageHeader';
import CoverageBarChart from '@/components/charts/CoverageBarChart';
import StatusDonutChart from '@/components/charts/StatusDonutChart';
import { formatDays, formatNumber } from '@/lib/inventory';
import type { InventorySummary, ProductAnalysis } from '@/types/inventory';

interface DashboardPageProps {
  items: ProductAnalysis[];
  summary: InventorySummary;
}

export default function DashboardPage({ items, summary }: DashboardPageProps) {
  const replenishmentItems = items.filter((item) => item.status === 'reposicao');

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral da situação dos seus estoques."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total de produtos"
          value={formatNumber(summary.totalProducts)}
          hint="Itens cadastrados no sistema"
          icon={Boxes}
          tone="navy"
        />
        <KpiCard
          label="Precisam de reposição"
          value={formatNumber(summary.replenishmentCount)}
          hint="Estoque abaixo ou igual ao ponto de pedido"
          icon={AlertTriangle}
          tone="rose"
        />
        <KpiCard
          label="Estoque normal"
          value={formatNumber(summary.normalCount)}
          hint="Produtos acima do ponto de pedido"
          icon={PackageCheck}
          tone="green"
        />
        <KpiCard
          label="Cobertura média"
          value={formatDays(summary.averageCoverageDays)}
          hint="Média de dias de estoque por produto"
          icon={Gauge}
          tone="amber"
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <h2 className="text-base font-semibold text-navy-900">Situação dos estoques</h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">Proporção de produtos por status</p>
          <StatusDonutChart
            normalCount={summary.normalCount}
            replenishmentCount={summary.replenishmentCount}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-3">
          <h2 className="text-base font-semibold text-navy-900">Cobertura em dias</h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">Quantos dias cada produto dura no ritmo de consumo atual</p>
          <CoverageBarChart items={items} />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-navy-900">Pedir reposição agora</h2>
        <p className="mb-5 mt-1 text-sm text-slate-500">Produtos que já chegaram ao ponto de pedido</p>

        {replenishmentItems.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-800">
            <PackageCheck className="h-5 w-5 shrink-0" />
            Nenhum produto precisa de reposição no momento.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {replenishmentItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-rose-100 bg-rose-50/50 p-4 transition hover:border-rose-200 hover:bg-rose-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-navy-900">{item.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Estoque {formatNumber(item.currentStock)} de {formatNumber(item.reorderPoint)} do ponto de pedido
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-rose-600">-{formatNumber(item.shortfallToReorderPoint)}</p>
                  <p className="text-xs text-slate-500">unidades</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
