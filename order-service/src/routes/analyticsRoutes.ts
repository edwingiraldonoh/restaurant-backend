import { Router } from 'express';
import { getAnalytics, exportAnalyticsCSV } from '../controllers/analyticsController';

const router = Router();

// GET /admin/analytics - Obtener analytics
router.get('/admin/analytics', getAnalytics);

// POST /admin/analytics/export - Exportar a CSV
router.post('/admin/analytics/export', exportAnalyticsCSV);

export default router;
