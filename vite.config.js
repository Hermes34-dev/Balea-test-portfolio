import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main:      './index.html',
        portfolio: './portfolio.html',
        react:     './react.html',
      },
    },
  },
});
