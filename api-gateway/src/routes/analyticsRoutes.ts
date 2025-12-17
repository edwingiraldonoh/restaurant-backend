import express, { Request, Response } from 'express';
import axios from 'axios';
import { config } from '../config';

const router = express.Router();
const ORDER_SERVICE_URL = config.services.orderService.url;

// Proxy para obtener analytics
router.get('/admin/analytics', async (req: Request, res: Response) => {
  try {
    const { from, to, groupBy, top } = req.query;
    const response = await axios.get(`${ORDER_SERVICE_URL}/admin/analytics`, {
      params: { from, to, groupBy, top },
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Error fetching analytics:', error.message);
    
    // Si es 204 No Content, pasarlo tal cual
    if (error.response?.status === 204) {
      res.status(204).send();
      return;
    }
    
    res.status(error.response?.status || 500).json(
      error.response?.data || { success: false, message: 'Error al obtener analytics' }
    );
  }
});

// Proxy para exportar analytics a CSV
router.post('/admin/analytics/export', async (req: Request, res: Response) => {
  try {
    const response = await axios.post(
      `${ORDER_SERVICE_URL}/admin/analytics/export`,
      req.body,
      { responseType: 'text' }
    );
    
    // Copiar headers relevantes
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition) {
      res.setHeader('Content-Disposition', contentDisposition);
    }
    res.setHeader('Content-Type', 'text/csv');
    
    res.status(response.status).send(response.data);
  } catch (error: any) {
    console.error('Error exporting analytics:', error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { success: false, message: 'Error al exportar analytics' }
    );
  }
});

export default router;
