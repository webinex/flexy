import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
// @ts-expect-error no definition
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default defineConfig({
  plugins: [
    peerDepsExternal({ includeDependencies: true }),
    react(),
    dts({
      include: ['lib'],
      tsconfigPath: resolve(__dirname, './tsconfig.lib.json'),
      outDir: resolve(__dirname, './dist/types'),
    }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/index.tsx'),
      formats: ['es'],
      fileName: 'main',
    }
  },
});
