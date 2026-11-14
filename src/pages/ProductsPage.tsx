
import { useMemo, useState } from 'react';
import { PackageSearch, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import {
  formatDays,
  formatNumber,
  matchesSearch,
  STATUS_LABELS,
} from '@/lib/inventory';
import type { ProductAnalysis, StockStatus } from '@/types/inventory';
import {
  cadastrarProduto,
  editarProduto,
  excluirProduto,
} from '@/lib/productsService';

interface ProductsPageProps {
  items: ProductAnalysis[];
  isAdmin: boolean;
}

type StatusFilter = 'todos' | StockStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'reposicao', label: STATUS_LABELS.reposicao },
  { value: 'normal', label: STATUS_LABELS.normal },
];

export default function ProductsPage({
  items,
  isAdmin,
}: ProductsPageProps) {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    currentStock: 0,
    safetyStock: 0,
    dailyConsumption: 0,
    leadTimeDays: 0,
  });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');

  const handleCreateProduct = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!isAdmin || saving) return;

    setSaving(true);
    setFormError('');

    try {
      if (editingProductId) {
        await editarProduto(editingProductId, newProduct);
        alert('Produto atualizado com sucesso!');
      } else {
        await cadastrarProduto(newProduct);
        alert('Produto cadastrado com sucesso!');
      }

      setShowForm(false);
      setEditingProductId(null);

      setNewProduct({
        name: '',
        currentStock: 0,
        safetyStock: 0,
        dailyConsumption: 0,
        leadTimeDays: 0,
      });

      window.location.reload();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Erro ao salvar produto.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduct = (item: ProductAnalysis) => {
    setNewProduct({
      name: item.name,
      currentStock: item.currentStock,
      safetyStock: item.safetyStock,
      dailyConsumption: item.dailyConsumption,
      leadTimeDays: item.leadTimeDays,
    });

    setEditingProductId(item.id);
    setFormError('');
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: string, name: string) => {
  if (!isAdmin) return;

  const confirmed = window.confirm(
    `Tem certeza que deseja excluir o produto "${name}"?`
  );

  if (!confirmed) return;

  try {
    await excluirProduto(id);

    alert('Produto excluído com sucesso!');
    window.location.reload();
  } catch (error) {
    alert(
      error instanceof Error
        ? error.message
        : 'Erro ao excluir produto.'
    );
  }
};

  const handleNewProduct = () => {
    setNewProduct({
      name: '',
      currentStock: 0,
      safetyStock: 0,
      dailyConsumption: 0,
      leadTimeDays: 0,
    });

    setEditingProductId(null);
    setFormError('');
    setShowForm(true);
  };

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          matchesSearch(item.name, query) &&
          (statusFilter === 'todos' || item.status === statusFilter)
      ),
    [items, query, statusFilter]
  );

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Acompanhe estoque, consumo e ponto de pedido de cada item."
      />

      {isAdmin && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={handleNewProduct}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 font-medium text-white transition hover:bg-green-700"
          
          >
            <Plus className="h-5 w-5" />
            
            Novo produto
          </button>
          
        </div>
        
      )}
      

      {isAdmin && showForm && (
        <form
          onSubmit={handleCreateProduct}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">
            {editingProductId ? 'Editar produto' : 'Cadastrar novo produto'}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {([
              ['name', 'Nome do produto'],
              ['currentStock', 'Estoque atual'],
              ['safetyStock', 'Estoque de segurança'],
              ['dailyConsumption', 'Consumo diário'],
              ['leadTimeDays', 'Prazo de entrega (dias)'],
            ] as const).map(([field, label]) => (
              <label key={field} className="flex flex-col gap-1">
                <span className="text-sm font-medium">{label}</span>

                <input
                  required
                  type={field === 'name' ? 'text' : 'number'}
                  min={field === 'name' ? undefined : 0}
                  step={field === 'name' ? undefined : 'any'}
                  value={newProduct[field]}
                  onChange={(event) =>
                    setNewProduct((previous) => ({
                      ...previous,
                      [field]:
                        field === 'name'
                          ? event.target.value
                          : Number(event.target.value),
                    }))
                  }
                  className="rounded-lg border border-slate-300 p-2"
                />
              </label>
            ))}
          </div>

          {formError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {formError}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingProductId(null);
                setFormError('');
              }}
              className="rounded-lg border px-4 py-2"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {saving
                ? 'Salvando...'
                : editingProductId
                  ? 'Salvar alterações'
                  : 'Salvar produto'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Pesquisar produto</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Pesquisar produto pelo nome"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-navy-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-navy-100"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((filter) => {
              const isActive = statusFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setStatusFilter(filter.value)}
                  aria-pressed={isActive}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="px-5 pt-4 text-xs text-slate-500">
          Mostrando {formatNumber(filteredItems.length)} de{' '}
          {formatNumber(items.length)} produtos
        </p>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <PackageSearch className="h-6 w-6" />
            </div>

            <p className="font-medium text-navy-900">
              Nenhum produto encontrado
            </p>

            <p className="text-sm text-slate-500">
              Tente outro nome ou altere o filtro de status.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto p-2 sm:p-3">
            <table className="w-full min-w-[850px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-3">Nome do produto</th>
                  <th className="px-3 py-3 text-right">Estoque atual</th>
                  <th className="px-3 py-3 text-right">Estoque de segurança</th>
                  <th className="px-3 py-3 text-right">Consumo diário</th>
                  <th className="px-3 py-3 text-right">Prazo de entrega</th>
                  <th className="px-3 py-3 text-right">Ponto de pedido</th>
                  <th className="px-3 py-3">Status</th>
                  {isAdmin && (
                    <th className="px-3 py-3 text-center">Ações</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="border-t border-slate-100 px-3 py-4 font-medium text-navy-900">
                      {item.name}
                    </td>

                    <td className="border-t border-slate-100 px-3 py-4 text-right tabular-nums text-slate-700">
                      {formatNumber(item.currentStock)}
                    </td>

                    <td className="border-t border-slate-100 px-3 py-4 text-right tabular-nums text-slate-700">
                      {formatNumber(item.safetyStock)}
                    </td>

                    <td className="border-t border-slate-100 px-3 py-4 text-right tabular-nums text-slate-700">
                      {formatNumber(item.dailyConsumption)}
                    </td>

                    <td className="border-t border-slate-100 px-3 py-4 text-right tabular-nums text-slate-700">
                      {formatDays(item.leadTimeDays)}
                    </td>

                    <td className="border-t border-slate-100 px-3 py-4 text-right tabular-nums font-medium text-navy-900">
                      {formatNumber(item.reorderPoint)}
                    </td>

                    <td className="border-t border-slate-100 px-3 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    {isAdmin && (
  <td className="border-t border-slate-100 px-3 py-4 text-center">
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => handleEditProduct(item)}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-blue-600 transition hover:bg-blue-50"
      >
        <Pencil className="h-4 w-4" />
        Editar
      </button>

      <button
        type="button"
        onClick={() => handleDeleteProduct(item.id, item.name)}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-red-600 transition hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Excluir
      </button>
    </div>
  </td>
)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
