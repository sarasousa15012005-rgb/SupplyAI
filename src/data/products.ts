import type { Product } from '@/types/inventory';

export const initialProducts: Product[] = [
  { id: 'arroz', name: 'Arroz', currentStock: 50, safetyStock: 20, dailyConsumption: 8, leadTimeDays: 5 },
  { id: 'feijao', name: 'Feijão', currentStock: 15, safetyStock: 10, dailyConsumption: 5, leadTimeDays: 7 },
  { id: 'acucar', name: 'Açúcar', currentStock: 80, safetyStock: 15, dailyConsumption: 4, leadTimeDays: 4 },
  { id: 'cafe', name: 'Café', currentStock: 10, safetyStock: 8, dailyConsumption: 3, leadTimeDays: 6 },
  { id: 'oleo', name: 'Óleo', currentStock: 40, safetyStock: 10, dailyConsumption: 6, leadTimeDays: 3 },
];
