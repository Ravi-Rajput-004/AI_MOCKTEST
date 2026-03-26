import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware.js';
import * as adminController from './admin.controller.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/growth', adminController.getUserGrowth);
router.get('/revenue', adminController.getRevenue);

export default router;
