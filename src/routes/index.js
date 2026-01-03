import express from 'express';
import authRoutes from './user.routes.js';
import hotelRoutes from './hotel.routes.js';

const router = express.Router();

router.use('/user', authRoutes);
router.use('/hotel', hotelRoutes);

export default router;