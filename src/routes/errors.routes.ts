import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const errorsRouter = Router();

// GET /errors - Obtener historial completo de errores
errorsRouter.get('/', (_req, res, next) => {
  try {
    const errorsPath = join(__dirname, '../data/errors-history.json');
    const errorsData = JSON.parse(readFileSync(errorsPath, 'utf-8'));

    res.json({
      success: true,
      data: errorsData,
    });
  } catch (error) {
    next(error);
  }
});

// GET /errors/summary - Resumen de estadísticas
errorsRouter.get('/summary', (_req, res, next) => {
  try {
    const errorsPath = join(__dirname, '../data/errors-history.json');
    const errorsData = JSON.parse(readFileSync(errorsPath, 'utf-8'));

    res.json({
      success: true,
      data: {
        project: errorsData.project,
        lastUpdated: errorsData.lastUpdated,
        totalErrors: errorsData.totalErrors,
        resolvedErrors: errorsData.resolvedErrors,
        statistics: errorsData.statistics,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /errors/:id - Obtener error específico por ID
errorsRouter.get('/:id', (req, res, next) => {
  try {
    const errorId = parseInt(req.params.id, 10);

    if (isNaN(errorId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid error ID',
      });
      return;
    }

    const errorsPath = join(__dirname, '../data/errors-history.json');
    const errorsData = JSON.parse(readFileSync(errorsPath, 'utf-8'));

    const error = errorsData.errors.find((e: any) => e.id === errorId);

    if (!error) {
      res.status(404).json({
        success: false,
        error: 'Error not found',
      });
      return;
    }

    res.json({
      success: true,
      data: error,
    });
  } catch (error) {
    next(error);
  }
});

// GET /errors/category/:category - Filtrar por categoría
errorsRouter.get('/category/:category', (req, res, next) => {
  try {
    const category = req.params.category;

    const errorsPath = join(__dirname, '../data/errors-history.json');
    const errorsData = JSON.parse(readFileSync(errorsPath, 'utf-8'));

    const filtered = errorsData.errors.filter(
      (e: any) => e.category.toLowerCase() === category.toLowerCase()
    );

    res.json({
      success: true,
      data: {
        category,
        count: filtered.length,
        errors: filtered,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /errors/learnings - Obtener lecciones aprendidas
errorsRouter.get('/learnings', (_req, res, next) => {
  try {
    const errorsPath = join(__dirname, '../data/errors-history.json');
    const errorsData = JSON.parse(readFileSync(errorsPath, 'utf-8'));

    res.json({
      success: true,
      data: {
        learnings: errorsData.keyLearnings,
      },
    });
  } catch (error) {
    next(error);
  }
});
