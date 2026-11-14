
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import type { Product } from '@/types/inventory';
import { analyzeProduct } from '@/lib/inventory';
import { supabase } from '@/lib/supabase';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

interface AssistantPageProps {
  products: Product[];
}

const SUGGESTED_QUESTIONS = [
  'Quais produtos precisam de reposição?',
  'Qual produto tem a menor cobertura?',
  'Quanto preciso comprar de feijão?',
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 0,
  role: 'assistant',
  text: 'Olá! Sou o assistente do SupplyAI. Já posso analisar seus produtos e ajudar com informações sobre estoque e reposição. O que deseja saber?',
};

function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AssistantPage({ products }: AssistantPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    WELCOME_MESSAGE,
  ]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const nextIdRef = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, isLoading]);

  const generateResponse = (question: string): string => {
    if (products.length === 0) {
      return 'Ainda não encontrei produtos cadastrados no estoque. Cadastre produtos para que eu possa realizar as análises.';
    }

    const analyses = products.map(analyzeProduct);
    const normalizedQuestion = normalizeText(question);

    // Identifica se a pergunta menciona um produto específico.
    const mentionedProduct = analyses.find((product) =>
      normalizedQuestion.includes(normalizeText(product.name))
    );

    // Pergunta sobre quantidade necessária para comprar.
    if (
      mentionedProduct &&
      (
        normalizedQuestion.includes('quanto') ||
        normalizedQuestion.includes('quantidade') ||
        normalizedQuestion.includes('comprar')
      )
    ) {
      const quantity = Math.ceil(
        mentionedProduct.shortfallToReorderPoint
      );

      if (quantity <= 0) {
        return `O produto ${mentionedProduct.name} não precisa de reposição neste momento. O estoque atual é de ${formatNumber(mentionedProduct.currentStock)} unidades e está acima do ponto de reposição.`;
      }

      return `Para o produto ${mentionedProduct.name}, recomendo comprar aproximadamente ${formatNumber(quantity)} unidades.\n\nEstoque atual: ${formatNumber(mentionedProduct.currentStock)} unidades.\nPonto de reposição: ${formatNumber(mentionedProduct.reorderPoint)} unidades.\nQuantidade necessária: ${formatNumber(quantity)} unidades.`;
    }

    // Pergunta sobre a menor cobertura.
    if (
      normalizedQuestion.includes('menor cobertura') ||
      normalizedQuestion.includes('menos cobertura') ||
      normalizedQuestion.includes('menor tempo') ||
      normalizedQuestion.includes('cobertura')
    ) {
      const withCoverage = analyses.filter(
        (product) => product.coverageDays !== null
      );

      if (withCoverage.length === 0) {
        return 'Não há dados de consumo diário suficientes para calcular a cobertura dos produtos.';
      }

      const lowest = [...withCoverage].sort(
        (a, b) => a.coverageDays! - b.coverageDays!
      )[0];

      return `O produto com menor cobertura é ${lowest.name}.\n\nEstoque atual: ${formatNumber(lowest.currentStock)} unidades.\nConsumo diário: ${formatNumber(lowest.dailyConsumption)} unidades.\nCobertura estimada: ${formatNumber(lowest.coverageDays!)} dias.\n\nEsse produto merece atenção porque possui menos dias de estoque disponível.`;
    }

    // Pergunta sobre produtos que precisam de reposição.
    if (
      normalizedQuestion.includes('reposic') ||
      normalizedQuestion.includes('repor') ||
      normalizedQuestion.includes('precisam comprar') ||
      normalizedQuestion.includes('precisa comprar')
    ) {
      const needingReplenishment = analyses.filter(
        (product) => product.status === 'reposicao'
      );

      if (needingReplenishment.length === 0) {
        return 'Ótima notícia! Nenhum produto está precisando de reposição neste momento.';
      }

      const list = needingReplenishment
        .map((product) =>
          `• ${product.name}: estoque atual de ${formatNumber(product.currentStock)} unidades. Quantidade sugerida para reposição: ${formatNumber(Math.ceil(product.shortfallToReorderPoint))} unidades.`
        )
        .join('\n\n');

      return `Encontrei ${needingReplenishment.length} produto(s) que precisam de reposição:\n\n${list}`;
    }

    // Pergunta sobre um produto específico.
    if (mentionedProduct) {
      const coverage =
        mentionedProduct.coverageDays === null
          ? 'Não calculada'
          : `${formatNumber(mentionedProduct.coverageDays)} dias`;

      return `Aqui estão os dados de ${mentionedProduct.name}:\n\nEstoque atual: ${formatNumber(mentionedProduct.currentStock)} unidades.\nEstoque de segurança: ${formatNumber(mentionedProduct.safetyStock)} unidades.\nConsumo diário: ${formatNumber(mentionedProduct.dailyConsumption)} unidades.\nPrazo de entrega: ${mentionedProduct.leadTimeDays} dias.\nCobertura: ${coverage}.\nPonto de reposição: ${formatNumber(mentionedProduct.reorderPoint)} unidades.\nSituação: ${mentionedProduct.status === 'reposicao' ? 'Precisa de reposição' : 'Estoque normal'}.`;
    }

    return 'Ainda não consegui identificar essa pergunta. Você pode perguntar sobre produtos que precisam de reposição, menor cobertura ou quantidade necessária para comprar. Também pode mencionar o nome de um produto.';
  };


const sendMessage = async (text: string) => {
  const trimmed = text.trim();

  if (!trimmed || isLoading) return;

  const userMessage: ChatMessage = {
    id: nextIdRef.current++,
    role: 'user',
    text: trimmed,
  };

  setMessages((current) => [...current, userMessage]);
  setDraft('');
  setIsLoading(true);

  try {
    if (!supabase) {
      throw new Error('Conexão com o Supabase não configurada.');
    }

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      throw new Error('Sua sessão expirou. Faça login novamente.');
    }

    const { data, error } = await supabase.functions.invoke(
      'assistente-supplyai',
      {
        body: {
          question: trimmed,
        },
      }
    );

    if (error) {
      console.error('Erro na Edge Function:', error);
      throw new Error(
        'Não foi possível obter uma resposta do assistente. Verifique a publicação da função e tente novamente.'
      );
    }

    if (!data?.answer) {
      throw new Error(
        data?.error || 'O assistente não retornou uma resposta.'
      );
    }

    const assistantMessage: ChatMessage = {
      id: nextIdRef.current++,
      role: 'assistant',
      text: data.answer,
    };

    setMessages((current) => [...current, assistantMessage]);

  } catch (error) {
    const errorMessage: ChatMessage = {
      id: nextIdRef.current++,
      role: 'assistant',
      text: error instanceof Error
        ? error.message
        : 'Ocorreu um erro ao consultar o assistente.',
    };

    setMessages((current) => [...current, errorMessage]);

  } finally {
    setIsLoading(false);
  }
};

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(draft);
  };

  return (
    <div>
      <PageHeader
        title="Assistente IA"
        description="Converse sobre os seus estoques e receba orientações de reposição."
      />

      <div className="flex h-[calc(100vh-14rem)] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-green-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-navy-900">
              Assistente SupplyAI
            </p>
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Análise de estoque ativa
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-50/60 px-4 py-6 sm:px-6">
          {messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={message.id}
                className={`flex items-end gap-3 ${
                  isUser ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isUser
                      ? 'bg-green-600 text-white'
                      : 'bg-navy-900 text-green-400'
                  }`}
                >
                  {isUser ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[70%] ${
                    isUser
                      ? 'rounded-br-md bg-navy-900 text-white'
                      : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            );
          })}

          <div ref={endRef} />
        </div>

        <div className="border-t border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Sparkles className="h-3 w-3" />
                {question}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <label className="flex-1">
              <span className="sr-only">Digite sua pergunta</span>
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Digite sua pergunta sobre o estoque..."
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-navy-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-navy-100 disabled:opacity-60"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading || draft.trim() === ''}
              aria-label="Enviar pergunta"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm transition hover:bg-green-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
