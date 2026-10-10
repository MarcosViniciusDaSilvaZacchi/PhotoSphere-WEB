# Checkpoint 1 — Revisão de Consistência do Backend (Parte A)

**Disciplina:** Programação Web (FrontEnd)  
**Projeto:** PhotoSphere (#15) — Plataforma de Compartilhamento de Fotos  
**Aluno:** Marcos Vinicius da Silva Zacchi  
**Data:** 20/09/2026  

---

## 1. Contexto e Objetivo

Este documento registra a auditoria e verificação de consistência arquitetural do back-end (`photosphere-api`) realizada na **Atividade 06**.
O objetivo é confirmar que o padrão de camadas estrito:
$$\text{Route} \longrightarrow \text{Controller} \longrightarrow \text{Service} \longrightarrow \text{Model}$$
estabelecido desde a Aula 01 se manteve sólido, organizado e sem desvios de responsabilidade através das sucessivas evoluções da API (módulo de busca na Aula 02, persistência de usuários na Aula 03, autenticação JWT na Aula 04 e upload de foto de perfil na Aula 05).

---

## 2. Checklist de Consistência — Perguntas e Respostas

### 1. Alguma rota (`*Routes.js`) contém lógica de negócio, em vez de só declarar verbo + caminho + middlewares + controller?
**Resposta:** **Não.**  
**Justificativa:** Tanto em `modules/search/searchRoutes.js` quanto em `modules/user/userRoutes.js`, os arquivos de rotas limitam-se exclusivamente a mapear o método HTTP (`GET`, `POST`, `PUT`) e o endpoint para seus respectivos middlewares (como `isAuthenticated`, `uploadProfile.single('profilePicture')`, validadores do `express-validator` e `asyncHandler`) e para a função de controle correspondente. Nenhuma regra de negócio, manipulação de banco de dados ou formatação de dados ocorre na camada de rotas.

### 2. Algum Controller consulta o Model diretamente, sem passar pelo Service?
**Resposta:** **Não.**  
**Justificativa:** Em ambos os controllers (`searchController.js` e `userController.js`), nenhum model Sequelize é importado ou consultado. Todas as operações de leitura, busca, escrita, hash e persistência são delegadas integralmente para `searchService.js` e `userService.js`. Os controllers apenas extraem os parâmetros da requisição (`req.body`, `req.query`, `req.params`, `req.user`, `req.file`), invocam o método do service correspondente e formatam a resposta HTTP através do padrão `res.success()`.

### 3. Algum Service faz referência a `req` / `res`?
**Resposta:** **Não.**  
**Justificativa:** Os serviços (`searchService.js` e `userService.js`) são funções JavaScript puras ou assíncronas que recebem apenas argumentos explícitos de domínio (por exemplo: strings como `username`, `email`, `password`, identificadores numéricos `userId`, e dados desestruturados). Eles não têm qualquer dependência dos objetos `req` ou `res` do Express, permitindo que a lógica de negócio seja desacoplada do protocolo HTTP e facilmente testável de forma unitária.

### 4. Todo Controller usa `success()` / `error()` de `apiResponse.js`?
**Resposta:** **Sim.**  
**Justificativa:** O middleware global `middlewares/apiResponse.js` injeta os métodos auxiliares `res.success(message, data, statusCode)` e `res.error(message, errors, statusCode)`. Todas as respostas de sucesso dos controllers utilizam `res.success()`. Em caso de erro ou exceções de negócio nos services, erros são disparados (`throw error`) com status codes apropriados e centralizadamente tratados pelo `middlewares/errorHandler.js`, que responde padronizadamente via JSON `{ success: false, message, errors }`.

### 5. Toda rota que chama uma função async está envolvida em `asyncHandler`?
**Resposta:** **Sim.**  
**Justificativa:** No arquivo `modules/user/userRoutes.js`, todas as rotas que acionam funções assíncronas (`userController.register`, `userController.login`, `userController.logout`, `userController.getMyProfile`, `userController.updateProfile` e `userController.getPublicProfile`) estão estritamente envolvidas pelo wrapper `asyncHandler(fn)`. Isso garante que qualquer rejeição de Promise (`Promise.reject`) seja capturada automaticamente e encaminhada para o middleware de erro global (`next(err)`), eliminando o risco de requisições pendentes (unhandled promise rejections).

### 6. Toda validação de entrada usa `express-validator`, sem nenhum `if` manual escondido?
**Resposta:** **Sim.**  
**Justificativa:** As validações de entrada residem declarativamente em `modules/user/userValidator.js`, usando as cadeias de verificação do `express-validator` (`registerValidator`, `loginValidator`, `profileUpdateValidator`). A verificação de erros é feita de forma unificada pela função de middleware `validate`, que intercepta falhas e dispara um erro com status 400 antes de chegar ao controller. Não existem verificações manuais de formato, presença ou tamanho de strings espalhadas pelos controllers.

### 7. `config/constants.js` não tem nenhuma constante solta sem uso, nem nenhum valor de validação fora dela?
**Resposta:** **Sim.**  
**Justificativa:** O arquivo `config/constants.js` centraliza de forma limpa as regras do domínio:
```javascript
module.exports = {
  VALIDATION: {
    USERNAME_MIN: 3,
    USERNAME_MAX: 20,
    PASSWORD_MIN: 6,
    BIO_MAX: 255,
  },
};
```
Todas essas constantes são importadas e consumidas em `modules/user/userValidator.js`, e os mesmos limites numéricos são espelhados no frontend para validação prévia de formulários.

### 8. A constante de limite da bio (Aula 05) é usada exatamente uma vez, no lugar certo?
**Resposta:** **Sim.**  
**Justificativa:** No backend, `VALIDATION.BIO_MAX` é referenciada exclusivamente dentro do validador `profileUpdateValidator` em `modules/user/userValidator.js` na regra `body('bio').optional().isLength({ max: VALIDATION.BIO_MAX })`. Nenhuma outra camada do backend duplica ou recalcula esse valor fixo.

---

## 3. Conclusão da Auditoria

A arquitetura do backend do PhotoSphere está 100% aderente às diretrizes estabelecidas. A separação de responsabilidades está preservada e nenhuma linha nova de código precisou ser adicionada na API nesta etapa, garantindo estabilidade e integridade para as próximas fases.
