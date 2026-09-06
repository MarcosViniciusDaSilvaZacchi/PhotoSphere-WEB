# Ficha de Preparação — PhotoSphere

> Documento de identificação do projeto, preenchido na Atividade 1 (E1)
> e mantido atualizado a cada entrega.

---

## Dados do Projeto

| Dado | Valor |
|---|---|
| **Nome do projeto** | PhotoSphere |
| **Número na lista** | #15 |
| **Aluno** | Mark V |
| **Disciplina** | Programação Web (FrontEnd) |

---

## Configuração Técnica

| Dado | Valor |
|---|---|
| **Pasta da API** | `photosphere-api` |
| **Pasta do Frontend** | `photosphere-frontend` |
| **Porta da API** | `3000` |
| **Porta do Frontend (Vite)** | `5173` |
| **URL base da API (local)** | `http://localhost:3000/api` |
| **Frontend URL (local)** | `http://localhost:5173` |
| **Nome do banco de dados MySQL** | `photosphere_db` |

---

## Entidade Principal

| Dado | Valor |
|---|---|
| **Entidade principal** | Foto |
| **Plural da entidade** | `fotos` |
| **O que substitui "vídeo" nos exemplos** | `foto` |
| **Campo de contagem de itens publicados** | `photosCount` |

> A entidade principal é o recurso central da aplicação — o que os usuários criam, compartilham e interagem. No PhotoSphere, esse recurso é a **foto**, e o campo `photosCount` contabiliza quantas fotos cada usuário já publicou.

---

## Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| **Backend** | Node.js v24 + Express |
| **Frontend** | Vue 3 + Vite |
| **Gerenciamento de estado** | Pinia |
| **Roteamento frontend** | Vue Router |
| **Cliente HTTP** | Axios (a partir da E2) |
| **Variáveis de ambiente** | dotenv (API) / Vite env (Frontend) |

---

## Histórico de Entregas

| Entrega | Atividade | Status |
|---|---|---|
| E1 | Setup da Aplicação — estrutura base, CORS, Landing Page com status da API | ✅ Concluída |
| E2 | Módulo Search (3 camadas) + Axios com interceptor centralizado | 🔄 Em andamento |
| E3 | — | ⏳ Pendente |
| E4 | — | ⏳ Pendente |
| E5 | — | ⏳ Pendente |
