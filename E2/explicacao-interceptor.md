# Explicação do Interceptor de Resposta (Axios)

O interceptor de resposta centraliza todo o tratamento de requisições e erros da aplicação PhotoSphere em um único ponto (`src/services/api.js`), eliminando a necessidade de cada tela/componente tratar erros à sua própria maneira.

Ele é composto por três ramos principais:

---

### 1. Ramo de Sucesso: `(response) => response.data`
- **O que faz:** "Descasca" o envelope padrão do Axios.
- **Por que existe:** Por padrão, o Axios encapsula a resposta dentro de um objeto contendo metadados (como headers, status, config e o corpo da resposta em `response.data`). Ao retornar diretamente `response.data`, qualquer camada de serviço ou componente que chamar `api.get()` ou `api.post()` já recebe diretamente a resposta no formato padronizado da nossa API `{ success, message, data }`, evitando ter que digitar `.data` repetidamente em todo o código.

---

### 2. Ramo de Erro de API: `if (error.response)`
- **O que faz:** Trata as respostas em que o servidor foi alcançado com sucesso, mas retornou um status HTTP de erro (famílias `4xx` ou `5xx`).
- **Por que existe:** Quando o back-end retorna, por exemplo, um `400 Bad Request` ou `401 Unauthorized`, o middleware `apiResponse.js` da nossa API já envia um JSON estruturado com `{ success: false, message, errors }`. O interceptor lê esse corpo em `error.response.data` e repassa essa mensagem e lista de erros para o `Promise.reject()`, preservando a mensagem original enviada pela API.

---

### 3. Ramo de Erro de Rede / Servidor Indisponível: `else if (error.request)`
- **O que faz:** Trata casos em que a requisição foi enviada pelo navegador, mas nenhuma resposta retornou.
- **Por que existe:** Ocorre quando o servidor back-end está desligado/fora do ar ou quando o usuário está sem conexão com a internet. Nesse cenário, `error.response` não existe (não há corpo nem status HTTP recebido). O interceptor captura isso e devolve uma mensagem amigável e padronizada (*"Não foi possível se conectar ao servidor. Verifique sua conexão ou tente mais tarde."*) em vez de estourar um erro técnico bruto do JavaScript.

---

### Ramo Alternativo: `else`
- Captura erros raros ocorridos durante a própria configuração ou montagem da requisição antes de ser disparada.

---

> **Resultado Prático:** Em qualquer situação de erro, qualquer chamada feita através de `api` sempre resultará em um `catch()` padronizado com o formato `{ message, errors, status }`.
