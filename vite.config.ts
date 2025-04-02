import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    // Enable jsdom environment for component testing
    environment: 'jsdom',
    // Other test options can be configured here
    globals: true,
  },
})
