import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { MockProvider } from '../services/providers/mockProvider.js';

export const storesRouter = Router();

storesRouter.use(requireAuth);

const mockProvider = new MockProvider();

storesRouter.get('/search', async (req, res, next) => {
  try {
    const { q, zip, provider = 'mock' } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }

    if (provider !== 'mock') {
      res.status(400).json({ error: 'Only "mock" provider is supported' });
      return;
    }

    const results = await mockProvider.search(q, zip as string | undefined);

    res.json({ results });
  } catch (error) {
    next(error);
  }
});
