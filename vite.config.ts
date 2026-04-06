import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';

const localSyncPlugin = () => ({
  name: 'local-sync-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!req.url?.includes('/api/sync')) {
        return next();
      }

      const dbPath = path.resolve(process.cwd(), 'noswrite-cloud.json');

      // Allow access from any computer on your Wi-Fi
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, PUT, POST, OPTIONS, DELETE',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Accept, Origin, X-Requested-With',
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
        const chunks: Buffer[] = [];
        req.on('data', (chunk) => {
          chunks.push(Buffer.from(chunk));
        });
        req.on('end', () => {
          try {
            const body = Buffer.concat(chunks);
            fs.writeFileSync(dbPath, body);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
          }
        });
        return;
      }

      res.statusCode = 405;
      res.end('Method Not Allowed');
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
