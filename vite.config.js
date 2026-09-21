import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages sirve este repo desde /base-pokedex-20262/, no desde la
  // raíz del dominio: sin esto los assets buildeados (/assets/...) se
  // pedirían contra la raíz y la página cargaría en blanco.
  base: '/base-pokedex-20262/',
})
