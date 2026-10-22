import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupVeeValidate } from './plugins/vee-validate'

// Initialize Vee-Validate validation rules and configuration
setupVeeValidate()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
