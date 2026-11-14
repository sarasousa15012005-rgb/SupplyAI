import type { InventorySummary, Product, ProductAnalysis, StockStatus } from '@/types/inventory';

export const STATUS_LABELS: Record<StockStatus, string> = {
  reposicao: 'Reposição necessária',
  normal: 'Estoque normal',
};

const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDays(value: number | null): string {
  return value === null ? 'Sem consumo' : `${formatNumber(value)} dias`;
}

export function calculateReorderPoint(product: Product): number {
  return product.dailyConsumption * product.leadTimeDays + product.safetyStock;
}

export function calculateCoverageDays(currentStock: number, dailyConsumption: number): number | null {
  if (dailyConsumption <= 0) return null;
  return currentStock / dailyConsumption;
}

export function getStockStatus(currentStock: number, reorderPoint: number): StockStatus {
  return currentStock <= reorderPoint ? 'reposicao' : 'normal';
}

export function analyzeProduct(product: Product): ProductAnalysis {
  const reorderPoint = calculateReorderPoint(product);
  return {
    ...product,
    reorderPoint,
    coverageDays: calculateCoverageDays(product.currentStock, product.dailyConsumption),
    shortfallToReorderPoint: Math.max(0, reorderPoint - product.currentStock),
    status: getStockStatus(product.currentStock, reorderPoint),
  };
}

export function summarizeInventory(items: ProductAnalysis[]): InventorySummary {
  const coverages = items
    .map((item) => item.coverageDays)
    .filter((coverage): coverage is number => coverage !== null);

  return {
    totalProducts: items.length,
    replenishmentCount: items.filter((item) => item.status === 'reposicao').length,
    normalCount: items.filter((item) => item.status === 'normal').length,
    averageCoverageDays:
      coverages.length > 0 ? coverages.reduce((sum, value) => sum + value, 0) / coverages.length : null,
    totalStock: items.reduce((sum, item) => sum + item.currentStock, 0),
    totalDailyConsumption: items.reduce((sum, item) => sum + item.dailyConsumption, 0),
    totalShortfall: items.reduce((sum, item) => sum + item.shortfallToReorderPoint, 0),
  };
}

export function matchesSearch(name: string, query: string): boolean {
  const normalize = (text: string) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  return normalize(name).includes(normalize(query));
}
