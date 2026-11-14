
import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { testarConexao } from './lib/testSupabase';
import { Boxes, Menu, LogOut } from 'lucide-react';

import { supabase } from './lib/supabase';
import LoginPage from './pages/LoginPage';

import Sidebar from '@/components/Sidebar';
import { NAV_ITEMS, type PageId } from '@/config/navigation';
import type { Product } from '@/types/inventory';
import { buscarProdutos } from '@/lib/productsService';

import AssistantPage from '@/pages/AssistantPage';
import DashboardPage from '@/pages/DashboardPage';
import ProductsPage from '@/pages/ProductsPage';
import ReportsPage from '@/pages/ReportsPage';

import { analyzeProduct, summarizeInventory } from '@/lib/inventory';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
  if (session) {
    testarConexao();
  }
}, [session]);
useEffect(() => {
  if (!session) return;

  async function carregarProdutos() {
    try {
      const dados = await buscarProdutos();
      setProducts(dados);
      console.log('Produtos carregados:', dados);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  }

  carregarProdutos();
}, [session]);

  const [currentPage, setCurrentPage] =
    useState<PageId>('dashboard');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;

    client.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Erro ao verificar sessão:', error);
      }

      setSession(data.session);
      setLoading(false);
    }).catch((error) => {
      console.error('Erro de autenticação:', error);
      setLoading(false);
    });

    const { data: { subscription } } =
      client.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setLoading(false);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

const analyses = useMemo(
  () => products.map(analyzeProduct),
  [products]
);
  

  const summary = useMemo(
    () => summarizeInventory(analyses),
    [analyses]
  );

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    setIsSidebarOpen(false);
  };

  const handleLogout = async () => {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert('Não foi possível sair. Tente novamente.');
    }
  };

  const pageTitle =
    NAV_ITEMS.find((item) => item.id === currentPage)?.label
    ?? 'SupplyAI';

    console.log('UID logado:', session?.user.id);

console.log(
  'É administradora:',
  session?.user.id === '484ee42d-c589-4b43-b436-7d7f6e52c84b'
);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardPage
            items={analyses}
            summary={summary}
          />
        );

      case 'produtos':
  return (
    <ProductsPage
      items={analyses}
      isAdmin={
        session?.user.id ===
        '484ee42d-c589-4b43-b436-7d7f6e52c84b'
      }
    />
  );

      case 'assistente':
  return <AssistantPage products={products} />;

      case 'relatorios':
        return (
          <ReportsPage
            items={analyses}
            summary={summary}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p>Carregando SupplyAI...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <Sidebar
        currentPage={currentPage}
        isOpen={isSidebarOpen}
        onNavigate={handleNavigate}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menu"
            className="rounded-lg p-2 text-navy-900 transition hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500 text-white">
              <Boxes className="h-4 w-4" />
            </div>

            <span className="text-sm font-semibold text-navy-900">
              {pageTitle}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:block">
              {session.user.email}
            </span>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div
            key={currentPage}
            className="mx-auto max-w-7xl animate-fade-in"
          >
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
