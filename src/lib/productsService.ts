
import { supabase } from './supabase';
import type { Product } from '@/types/inventory';

export type DadosProduto = Omit<Product, 'id'>;

// CONVERTER DADOS PARA O SUPABASE
function converterProduto(produto: DadosProduto) {
  return {
    nome: produto.name,
    estoque_atual: produto.currentStock,
    estoque_seguranca: produto.safetyStock,
    consumo_diario: produto.dailyConsumption,
    prazo_entrega: produto.leadTimeDays,
  };
}

// BUSCAR PRODUTOS
export async function buscarProdutos(): Promise<Product[]> {
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase
    .from('produtos')
    .select(
      'id, nome, estoque_atual, estoque_seguranca, consumo_diario, prazo_entrega'
    )
    .order('id', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((produto) => ({
    id: String(produto.id),
    name: produto.nome,
    currentStock: Number(produto.estoque_atual),
    safetyStock: Number(produto.estoque_seguranca),
    dailyConsumption: Number(produto.consumo_diario),
    leadTimeDays: Number(produto.prazo_entrega),
  }));
}

// CADASTRAR PRODUTO
export async function cadastrarProduto(
  produto: DadosProduto
) {
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase
    .from('produtos')
    .insert(converterProduto(produto))
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// EDITAR PRODUTO
export async function editarProduto(
  id: string,
  produto: DadosProduto
) {
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase
    .from('produtos')
    .update(converterProduto(produto))
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// EXCLUIR PRODUTO
export async function excluirProduto(id: string) {
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(
      'Produto não encontrado ou exclusão não permitida.'
    );
  }
}
