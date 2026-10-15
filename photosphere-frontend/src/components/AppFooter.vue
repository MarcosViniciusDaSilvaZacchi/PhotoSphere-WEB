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
  padding: 1.25rem 2rem;
  background-color: var(--ps-bg);
  border-top: 1px solid var(--ps-border);
  color: var(--ps-muted);
  font-size: 0.85rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.footer__links {
  display: flex;
  gap: 1.5rem;
}

.footer__links a {
  color: var(--ps-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.footer__links a:hover {
  color: var(--brand-color-light);
}
</style>
