import { Boxes, X } from 'lucide-react';
import { NAV_ITEMS, type PageId } from '@/config/navigation';

interface SidebarProps {
  currentPage: PageId;
  isOpen: boolean;
  onNavigate: (page: PageId) => void;
  onClose: () => void;
}

export default function Sidebar({ currentPage, isOpen, onNavigate, onClose }: SidebarProps) {
  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-navy-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-900 text-navy-100 shadow-xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500 text-white shadow-lg shadow-green-500/30">
              <Boxes className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">SupplyAI</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="rounded-lg p-1.5 text-navy-200 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="px-6 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-navy-300">Menu</p>
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === currentPage;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-navy-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-green-400 transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-green-400' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="m-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-medium text-white">Dados de demonstração</p>
          <p className="mt-1 text-xs leading-relaxed text-navy-300">
            As informações exibidas são fictícias e servem apenas para apresentação.
          </p>
        </div>
      </aside>
    </>
  );
}
