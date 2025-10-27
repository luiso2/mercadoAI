import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middlewares/auth.js';
import { List } from '../models/List.js';
import { getSuggestions } from '../services/suggest.js';

export const listsRouter = Router();

listsRouter.use(requireAuth);

const createListSchema = z.object({
  title: z.string().optional(),
});

const addItemSchema = z.object({
  name: z.string().min(1),
  qty: z.number().positive().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
  category: z.string().optional(),
  storeHint: z.string().optional(),
  price: z.number().optional(),
});

const updateItemSchema = z.object({
  name: z.string().optional(),
  qty: z.number().positive().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'bought', 'skipped']).optional(),
  category: z.string().optional(),
  storeHint: z.string().optional(),
  price: z.number().optional(),
});

listsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const lists = await List.find({ userId: req.user!.uid }).sort({ updatedAt: -1 });
    res.json(lists);
  } catch (error) {
    next(error);
  }
});

listsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const body = createListSchema.parse(req.body);

    const list = await List.create({
      userId: req.user!.uid,
      title: body.title || 'Shopping List',
    });

    res.status(201).json(list);
  } catch (error) {
    next(error);
  }
});

listsRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const list = await List.findOne({ _id: req.params.id, userId: req.user!.uid });

    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    res.json(list);
  } catch (error) {
    next(error);
  }
});

listsRouter.post('/:id/items', async (req: AuthRequest, res, next) => {
  try {
    const body = addItemSchema.parse(req.body);

    const list = await List.findOne({ _id: req.params.id, userId: req.user!.uid });

    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    list.items.push({
      name: body.name,
      qty: body.qty || 1,
      unit: body.unit || 'unit',
      notes: body.notes,
      status: 'pending',
      category: body.category,
      storeHint: body.storeHint,
      price: body.price,
    });

    await list.save();

    res.status(201).json(list);
  } catch (error) {
    next(error);
  }
});

listsRouter.patch('/:id/items/:itemId', async (req: AuthRequest, res, next) => {
  try {
    const body = updateItemSchema.parse(req.body);

    const list = await List.findOne({ _id: req.params.id, userId: req.user!.uid });

    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    const item = (list.items as any).id(req.params.itemId);

    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    if (body.name !== undefined) item.name = body.name;
    if (body.qty !== undefined) item.qty = body.qty;
    if (body.unit !== undefined) item.unit = body.unit;
    if (body.notes !== undefined) item.notes = body.notes;
    if (body.status !== undefined) item.status = body.status;
    if (body.category !== undefined) item.category = body.category;
    if (body.storeHint !== undefined) item.storeHint = body.storeHint;
    if (body.price !== undefined) item.price = body.price;

    await list.save();

    res.json(list);
  } catch (error) {
    next(error);
  }
});

listsRouter.delete('/:id/items/:itemId', async (req: AuthRequest, res, next) => {
  try {
    const list = await List.findOne({ _id: req.params.id, userId: req.user!.uid });

    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    const item = (list.items as any).id(req.params.itemId);

    if (!item) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    item.deleteOne();
    await list.save();

    res.json(list);
  } catch (error) {
    next(error);
  }
});

listsRouter.get('/:id/suggest', async (req: AuthRequest, res, next) => {
  try {
    const list = await List.findOne({ _id: req.params.id, userId: req.user!.uid });

    if (!list) {
      res.status(404).json({ error: 'List not found' });
      return;
    }

    const itemNames = list.items.map((item) => item.name);
    const suggestions = getSuggestions(itemNames);

    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
});
