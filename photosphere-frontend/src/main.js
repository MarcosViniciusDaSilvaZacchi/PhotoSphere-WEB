import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import './assets/interactions.css' // Aula 10: curtidas e comentários

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
