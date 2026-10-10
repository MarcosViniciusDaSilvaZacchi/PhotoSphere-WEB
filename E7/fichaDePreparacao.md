# Ficha de Preparação — PhotoSphere | Atividade 07

> Documento de identificação do projeto e mapeamento de domínio para a Atividade 07 (Upload da Entidade Principal com Indicador de Progresso).

---

## 1. Dados do Projeto

| Dado | Valor |
|---|---|
| **Nome do projeto** | PhotoSphere |
| **Número na lista** | #15 |
| **Aluno** | Marcos Vinicius da Silva Zacchi (Mark V) |
| **Disciplina** | Programação Web (FrontEnd) |

---

## 2. Mapeamento da Entidade Principal (Seção 2 do Enunciado)

| Dado | Seu valor |
|---|---|
| **Nome do model da sua entidade principal (singular, PascalCase)** | `Photo` |
| **Nome da tabela (plural, snake_case)** | `photos` |
| **Grupo (A ou B, conforme o enunciado)** | **Grupo B** (um único arquivo: a imagem enviada é o próprio conteúdo) |
| **Nome do campo do arquivo principal** | `image` |
| **Nome do campo da capa (só se Grupo A)** | *Não se aplica (Grupo B — mídia única)* |
| **Nome da coluna de contagem no User que será incrementada** | `photosCount` *(mesma definida desde a Aula 03)* |

---

## 3. Justificativa da Escolha do Grupo B

O **PhotoSphere** é uma plataforma focada no compartilhamento de fotografias em alta resolução. Diferente de aplicações de streaming de vídeo ou podcast (Grupo A) — que demandam um arquivo pesado de mídia acompanhado de uma imagem de capa/thumbnail separada —, no PhotoSphere o arquivo principal publicado **já é a própria fotografia**. Portanto, a imagem enviada desempenha simultaneamente o papel de conteúdo e de identidade visual, sendo gerenciada via `multer.single('image')`.
