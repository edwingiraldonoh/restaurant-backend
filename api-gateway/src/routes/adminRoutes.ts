import { Router, Request, Response } from 'express';
import axios from 'axios';
import { config } from '../config';

const router = Router();

// Endpoint de analíticas (mock básico)
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    // Parámetros de ejemplo
    const { from, to, groupBy } = req.query;

    // Aquí podrías hacer peticiones a order-service, kitchen-service, etc.
    // Por ahora, devolvemos datos de ejemplo
    res.json({
      success: true,
      from,
      to,
      groupBy,
      data: [
        { label: '2025-11', totalOrders: 12, totalSales: 150000 },
        { label: '2025-12', totalOrders: 18, totalSales: 210000 }
      ]
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo analíticas',
      details: error.message
    });
  }
});

export default router;
