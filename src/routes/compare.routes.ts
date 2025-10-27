import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { MockProvider } from '../services/providers/mockProvider.js';

export const compareRouter = Router();

compareRouter.use(requireAuth);

const mockProvider = new MockProvider();

compareRouter.get('/search', async (req, res, next) => {
  try {
    const { q, zip, providers = 'mock' } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Query parameter "q" is required' });
      return;
    }

    const providerList = (providers as string).split(',');

    const validProviders = providerList.filter((p) => p === 'mock');

    if (validProviders.length === 0) {
      res.status(400).json({ error: 'No valid providers specified' });
      return;
    }

    const results = await mockProvider.search(q, zip as string | undefined);

    res.json({
      query: q,
      zip: zip || null,
      providers: ['mock'],
      results,
    });
  } catch (error) {
    next(error);
  }
});
