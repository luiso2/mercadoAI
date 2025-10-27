import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import { env } from './env.js';
import { authRouter } from './routes/auth.routes.js';
import { oauthRouter } from './routes/oauth.routes.js';
import { listsRouter } from './routes/lists.routes.js';
import { storesRouter } from './routes/stores.routes.js';
import { compareRouter } from './routes/compare.routes.js';
import { errorHandler } from './middlewares/error.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const app = express();

app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
    },
  })
);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    message: 'Mercado AI Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      openapi: '/openapi',
      auth: '/auth/google/verify',
      oauth: '/oauth/authorize',
      lists: '/lists',
      stores: '/stores/search',
      compare: '/compare/search',
    },
  });
});

// Enhanced health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

app.get('/openapi', (req, res) => {
  try {
    const acceptHeader = req.headers.accept || '';

    if (acceptHeader.includes('application/json')) {
      // Serve JSON format
      const jsonPath = join(__dirname, 'openapi', 'openapi.json');
      const jsonContent = readFileSync(jsonPath, 'utf-8');
      const spec = JSON.parse(jsonContent);
      spec.servers[0].url = env.BASE_URL;
      res.setHeader('Content-Type', 'application/json');
      res.json(spec);
    } else {
      // Serve YAML format (default)
      const yamlPath = join(__dirname, 'openapi', 'openapi.yaml');
      let yamlContent = readFileSync(yamlPath, 'utf-8');
      yamlContent = yamlContent.replace('${BASE_URL}', env.BASE_URL);
      res.setHeader('Content-Type', 'application/x-yaml');
      res.send(yamlContent);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to load OpenAPI spec' });
  }
});

app.use('/auth', authRouter);
app.use('/auth', oauthRouter); // Also mount OAuth routes under /auth for compatibility
app.use('/oauth', oauthRouter);
app.use('/api/auth', authRouter); // Support /api/auth prefix for ChatGPT compatibility
app.use('/api/auth', oauthRouter); // Support /api/auth prefix for ChatGPT compatibility
app.use('/lists', listsRouter);
app.use('/stores', storesRouter);
app.use('/compare', compareRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);
