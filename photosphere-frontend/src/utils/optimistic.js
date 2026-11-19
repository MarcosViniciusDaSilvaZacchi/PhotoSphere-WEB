/**
 * utils/optimistic.js — O miolo da atualização otimista (Aula 13).
 *
 * Extraído no TERCEIRO caso (regra dos três): curtir (Aula 10), seguir (Aula 11)
 * e marcar/desmarcar um álbum no modal "Salvar" (Aula 13). Com três exemplos ficou
 * claro o que é igual em todos:
 *
 *  1. apply()   → muda a tela NA HORA e devolve a função que desfaz essa mudança;
 *  2. request() → faz a chamada à API (devolve a promessa);
 *  3. sucesso   → confirm(dados da API) acerta a tela com os números do servidor;
 *     erro      → undo() volta exatamente ao que era.
 *
 * O que muda de um caso para outro (qual estado, como desfazer) fica com quem chama:
 * por isso apply DEVOLVE o undo — só ele sabe desfazer o que fez.
 * Sem if e sem toast aqui: o aviso de erro é do interceptor do Axios.
 *
 * @param {{ apply: () => () => void, request: () => Promise<any>, confirm?: (data: any) => void }} steps
 * @returns {Promise<boolean>} true se a API confirmou, false se houve rollback
 */
export async function runOptimistic({ apply, request, confirm }) {
  const undo = apply()
  try {
    const response = await request()
    if (confirm) confirm(response.data)
    return true
  } catch {
    undo()
    return false
  }
}
