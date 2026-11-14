import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { STATUS_LABELS } from '@/lib/inventory';
import type { StockStatus } from '@/types/inventory';

interface StatusBadgeProps {
  status: StockStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isReplenishment = status === 'reposicao';
  const Icon = isReplenishment ? AlertTriangle : CheckCircle2;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        isReplenishment
          ? 'bg-rose-50 text-rose-700 ring-rose-200'
          : 'bg-green-50 text-green-700 ring-green-200'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {STATUS_LABELS[status]}
    </span>
  );
}
