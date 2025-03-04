import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
//import istanbul from 'vite-plugin-istanbul';
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    manifest: true,
    commonjsOptions: { transformMixedEsModules: true } // Change
  },
  base: process.env.mode === "production" ? "/static/" : "/",
  root: "./",
  plugins: [
    tailwindcss(),
    react(),    
    ],
    server : {
      cors : {
        origin : [process.env.VITE_APP_API_URL],
        credentials : true
      }
    }
})
