import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

import { tanstackRouter } from '@tanstack/router-plugin/vite'
// Node solution for __dirname
// import { resolve } from 'node:path'



// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react',autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    wasm(),
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  optimizeDeps: {
    // Don't optimize these packages as they contain web workers and WASM files.
    // https://github.com/vitejs/vite/issues/11672#issuecomment-1415820673
    exclude: ['@journeyapps/wa-sqlite', '@powersync/web'],
    include: []
  },
  worker: {
      format: 'es',
      plugins: () => [wasm(), topLevelAwait()]
    }
})
