import { BarChart3, Bot, LayoutDashboard, Package, type LucideIcon } from 'lucide-react';

export type PageId = 'dashboard' | 'produtos' | 'assistente' | 'relatorios';

export interface NavItem {
  id: PageId;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'assistente', label: 'Assistente IA', icon: Bot },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
];
