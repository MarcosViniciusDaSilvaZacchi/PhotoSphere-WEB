<template>
  <footer class="footer">
    <p>© 2026 PhotoSphere — Todos os direitos reservados</p>
    <nav class="footer__links">
      <RouterLink to="/explore">Explorar</RouterLink>
      <RouterLink to="/login">Entrar</RouterLink>
      <RouterLink to="/register">Cadastrar</RouterLink>
    </nav>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #1a1a2e;
  color: #aaa;
  font-size: 0.85rem;
}

.footer__links {
  display: flex;
  gap: 1.5rem;
}

.footer__links a {
  color: #aaa;
  text-decoration: none;
  transition: color 0.2s;
}

.footer__links a:hover {
  color: #fff;
}
</style>
