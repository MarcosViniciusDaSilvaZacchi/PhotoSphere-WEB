/**
 * src/config/constants.js — Valores do front em um lugar só (Aula 12).
 *
 * Os LIMITS espelham VALIDATION de photosphere-api/config/constants.js:
 * se um número mudar lá, muda aqui também (a validação do front é só uma
 * cópia otimista — quem decide é a API).
 */

// Chaves do localStorage — escritas à mão em api.js e stores/auth.js até a Aula 11
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
}

// Limites de validação (iguais aos da API)
export const LIMITS = {
  USERNAME_MIN: 3,
  USERNAME_MAX: 20,
  PASSWORD_MIN: 6,
  BIO_MAX: 255,
  TITLE_MAX: 100,
  DESCRIPTION_MAX: 500,
  COMMENT_MAX: 500,
  // Aula 13: álbuns (iguais a VALIDATION.ALBUM_* da API)
  ALBUM_TITLE_MIN: 3,
  ALBUM_TITLE_MAX: 100,
  ALBUM_DESCRIPTION_MAX: 500,
}

// Aula 13: busca — mínimo de letras (igual ao SEARCH.MIN_LENGTH da API) e o tempo de pausa do debounce
export const SEARCH = {
  MIN_LENGTH: 2,
  DEBOUNCE_MS: 400,
}

// Itens por página nos feeds (a API aceita até PAGINATION.MAX_LIMIT = 50)
export const PAGE_SIZE = 12

// Quanto tempo cada toast fica na tela (ms)
export const TOAST_DURATION = {
  SUCCESS: 3500,
  ERROR: 6000,
  INFO: 4000,
}

// Mensagens padrão
export const MESSAGES = {
  NETWORK_ERROR: 'Não foi possível se conectar ao servidor. Verifique sua conexão ou tente mais tarde.',
  UNEXPECTED_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
  REQUEST_ERROR: 'Erro inesperado ao preparar a requisição.',
}
