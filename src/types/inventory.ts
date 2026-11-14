export interface Product {
  id: string;
  name: string;
  currentStock: number;
  safetyStock: number;
  dailyConsumption: number;
  leadTimeDays: number;
}

export type StockStatus = 'reposicao' | 'normal';

export interface ProductAnalysis extends Product {
  coverageDays: number | null;
  reorderPoint: number;
  shortfallToReorderPoint: number;
  status: StockStatus;
}

export interface InventorySummary {
  totalProducts: number;
  replenishmentCount: number;
  normalCount: number;
  averageCoverageDays: number | null;
  totalStock: number;
  totalDailyConsumption: number;
  totalShortfall: number;
}
