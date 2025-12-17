import { Router } from 'express';
import {
  createReview,
  getPublicReviews,
  getAllReviews,
  getReviewById,
  updateReviewStatus,
  deleteReview,
} from '../controllers/reviewController';

const router = Router();

// Rutas públicas
router.post('/', createReview);
router.get('/', getPublicReviews);
router.get('/:id', getReviewById);

// Rutas de administración
router.get('/admin/reviews', getAllReviews);
router.patch('/admin/:id/status', updateReviewStatus);
router.delete('/admin/:id', deleteReview);

export default router;
