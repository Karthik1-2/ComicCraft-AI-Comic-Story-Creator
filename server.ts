import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import comicRoutes from './server/routes/comicRoutes.ts';
import { initDatabase } from './server/db/database.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Body parsers with generous limits for high-res images / SVG payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/comics', comicRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    mongodbConfigured: Boolean(process.env.MONGODB_URI),
  });
});

async function startServer() {
  try {
    // Initialize Database (MongoDB / fallback JSON storage)
    await initDatabase();

    if (!isProduction) {
      // In development, hook Vite's middlewares into Express
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Vite middleware mounted in development mode.');
    } else {
      // In production, serve the built Vite static assets
      const distPath = path.resolve('dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log('Production static distribution serving enabled.');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`ComicCraft server successfully running at http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Fatal error starting ComicCraft server:', error);
    process.exit(1);
  }
}

startServer();
