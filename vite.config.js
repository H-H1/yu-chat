import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ilink-proxy': {
        target: 'https://ilinkai.weixin.qq.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ilink-proxy/, '')
      }
    }
  }
})
