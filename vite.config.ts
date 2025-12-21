import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    cors: true,
    origin: 'http://localhost:5173',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      '/api/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (path) => {
          // Rewrite /api/openai/chat/completions to /v1/chat/completions
          const rewritten = path.replace(/^\/api\/openai/, '/v1');
          console.log('[Vite Proxy] Rewriting path:', path, '->', rewritten);
          return rewritten;
        },
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Forward the API key from the request header
            // Headers are lowercased in Node.js http module
            const apiKey = req.headers['x-api-key'] as string;
            
            if (apiKey) {
              proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
              // Ensure Content-Type is set
              if (!proxyReq.getHeader('Content-Type')) {
                proxyReq.setHeader('Content-Type', 'application/json');
              }
            } else {
              console.error('[Vite Proxy] ERROR: No API key found in request headers');
              console.log('[Vite Proxy] Request headers:', Object.keys(req.headers));
            }
            
            // Remove the custom header before forwarding to OpenAI
            proxyReq.removeHeader('x-api-key');
          });
          
          proxy.on('proxyRes', (proxyRes) => {
            // Log response status for debugging
            if (proxyRes.statusCode === 401) {
              console.error('[Vite Proxy] 401 Unauthorized - API key issue');
            }
          });
          
          proxy.on('error', (err) => {
            console.error('[Vite Proxy] Proxy error:', err);
          });
        },
      },
    },
  },
  root: path.resolve(__dirname),
  publicDir: 'public',
});
