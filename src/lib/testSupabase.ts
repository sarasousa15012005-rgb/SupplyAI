
import { buscarProdutos } from './productsService';

export async function testarConexao() {
  try {
    const produtos = await buscarProdutos();

    console.log('Produtos encontrados:', produtos);
    console.log('Quantidade:', produtos.length);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
  }
}
