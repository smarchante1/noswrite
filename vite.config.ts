import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';

const localSyncPlugin = () => ({
  name: 'local-sync-plugin',
  configureServer(server) {
    server.middlewares.use('/api/sync', (req, res, next) => {
      const dbPath = path.resolve(__dirname, 'noswrite-cloud.json');

      // Allow access from any computer on your Wi-Fi
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Master-Key',
      );

      if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
      }

      if (req.method === 'GET') {
        if (fs.existsSync(dbPath)) {
          res.setHeader('Content-Type', 'application/json');
          fs.createReadStream(dbPath).pipe(res);
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify([]));
        }
        return;
      }

      if (req.method === 'PUT') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          fs.writeFileSync(dbPath, body);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        });
        return;
      }

      next();
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), localSyncPlugin()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: true, // Exposes the server to your local network
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
