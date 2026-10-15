# Respostas — Atividade 09

**Disciplina:** Programação Web (FrontEnd)  
**Projeto:** PhotoSphere (#15)  
**Aluno:** Marcos Vinicius da Silva Zacchi  

---

### 1. Qual a diferença entre 401, 403 e 404, e por que "existe?" vem antes de "é seu?"

`401 Unauthorized` significa que a API não sabe quem está pedindo (sem token ou token inválido). `403 Forbidden` significa que ela sabe quem é, mas essa pessoa não pode fazer aquilo (B tentando editar a foto de A). `404 Not Found` significa que o recurso não existe. No `photoService.findOwnedPhotoOrFail` a checagem de existência vem primeiro porque só dá para perguntar "de quem é esta foto?" se a foto existir. Na ordem inversa, um id inexistente cairia no `403`, e a API estaria afirmando que existe uma foto com aquele id que pertence a outra pessoa — uma resposta falsa.

### 2. Por que, ao excluir ou trocar um arquivo, o banco é atualizado antes do disco?

Porque a falha que sobra é a menos grave. No `updatePhoto`, primeiro o registro passa a apontar para a imagem nova e só depois a antiga é apagada; no `deletePhoto`, primeiro o registro sai do banco e só depois o arquivo é removido. Se o disco falhar, sobra no máximo um arquivo esquecido na pasta, invisível para o usuário. Na ordem inversa, se o arquivo fosse apagado e o `update`/`destroy` falhasse, o banco continuaria apontando para uma imagem que não existe mais: a foto apareceria quebrada no feed, no perfil e no detalhe para todo mundo.

### 3. O que é um arquivo órfão? Dois exemplos do PhotoSphere e onde acontece a limpeza

É um arquivo gravado em `public/uploads/` sem nenhum registro no banco apontando para ele. Ele surge porque o Multer grava o arquivo **antes** do validador e do controller rodarem. Exemplo 1: um `PUT /api/photos/:id` com imagem nova e título vazio — o Multer salva a imagem, o `updatePhotoValidator` responde `400` e o arquivo ficaria sem dono. Exemplo 2: a usuária B envia um `PUT` com imagem para a foto da A — a imagem é salva e o service responde `403`. O mesmo vale para a foto de perfil enviada com uma bio maior que 255 caracteres. A limpeza acontece no `middlewares/errorHandler.js`: todo erro passa por ele, e ele apaga `req.file` / `req.files` antes de responder. Nos testes a contagem de arquivos da pasta `uploads/photos` ficou igual antes e depois dessas requisições.

### 4. Por que o botão de excluir não pode ficar dentro de um `<a>`, e por que o modal não pode ficar dentro do card?

Pela especificação do HTML, um `<a>` não pode conter elementos interativos como `<button>`. Além disso, o clique no botão "Excluir" propagaria até o link e o navegador navegaria para o detalhe da foto em vez de abrir a confirmação. Por isso o `PhotoCard` deixou de ser um link gigante: só a imagem e o título são links, e as ações entram pelo slot `actions`. O modal fica fora do card porque o card tem `transform` no `:hover`; um elemento com `transform` passa a ser a referência de um `position: fixed` interno, então o modal ficaria preso ao card e "andaria" com o mouse em vez de ficar centralizado na tela. Também não faria sentido ter um modal por card. Em `MyPhotosView.vue` existe um único `BaseModal`, fora do `v-for`, e o próprio `BaseModal` usa `<Teleport to="body">`.

### 5. Por que esconder o botão "Editar" de quem não é dono não é segurança?

Porque o frontend roda no navegador do usuário e ele controla tudo ali: pode digitar `/photo/5/edit` na barra de endereços, alterar o `isOwner` pelo Vue DevTools ou chamar a API direto com `curl`, sem usar a interface. O `v-if="isOwner"` no Detalhe é só usabilidade — evita mostrar um botão que não funcionaria. A segurança está no backend: `GET /photos/:id/edit`, `PUT` e `DELETE` passam por `isAuthenticated` e verificam o dono no service, respondendo `403` para quem não é. Foi isso que os testes com o token da B confirmaram.
