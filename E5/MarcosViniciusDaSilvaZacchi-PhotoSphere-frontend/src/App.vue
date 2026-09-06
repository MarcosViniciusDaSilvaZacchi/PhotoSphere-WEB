<script setup>
// App.vue — componente raiz da aplicação.
// Envolve todas as páginas com o layout base: Navbar + conteúdo + Footer.
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <div class="app-layout">
    <!-- Navbar fixa no topo — aparece em todas as páginas -->
    <AppNavbar />

    <!-- RouterView renderiza a View da rota atual -->
    <main class="app-content">
      <RouterView />
    </main>

    <!-- Footer fixo no rodapé — aparece em todas as páginas -->
    <AppFooter />
  </div>
</template>

<style>
/* Reset global — remove margens e paddings padrão do browser */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

/* Layout flexbox em coluna para grudar o footer no fundo */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* O conteúdo principal cresce e empurra o footer para baixo */
.app-content {
  flex: 1;
  padding: 2rem;
}
</style>
