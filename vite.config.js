import { defineConfig } from 'vite';

export default defineConfig({
  base: "/CosmicLab/",
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        nested: 'nested/index.html',
        planetDesigner: 'nested/planet-designer.html',
        render: 'nested/render.html',
        profile: 'nested/profile.html',
        login: 'nested/login.html'
      }
    }
  }
});