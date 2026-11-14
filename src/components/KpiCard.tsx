import type { LucideIcon } from 'lucide-react';

type KpiTone = 'navy' | 'green' | 'rose' | 'amber';

const TONE_CLASSES: Record<KpiTone, string> = {
  navy: 'bg-navy-50 text-navy-700',
  green: 'bg-green-50 text-green-700',
  rose: 'bg-rose-50 text-rose-600',
  amber: 'bg-amber-50 text-amber-600',
};

interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone: KpiTone;
}

export default function KpiCard({ label, value, hint, icon: Icon, tone }: KpiCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-navy-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${TONE_CLASSES[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{hint}</p>
    </div>
  );
}
