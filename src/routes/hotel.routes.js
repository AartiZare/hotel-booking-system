import express from 'express';
import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  searchHotels,
  deleteHotel
} from '../controllers/hotel.controller.js';

import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';
import { uploadHotelPhotos } from '../middlewares/upload.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

import {
  createHotelSchema,
  updateHotelSchema,
  searchHotelSchema
} from '../validations/hotel.validations.js';

const router = express.Router();

router.get('/search', validate(searchHotelSchema, 'query'), searchHotels);
router.get('/:id', getHotelById);

router.get('/', verifyToken, isAdmin, getHotels);

router.post(
  '/',
  verifyToken,
  isAdmin,
  uploadHotelPhotos.array('photos', 5),
  validate(createHotelSchema),
  createHotel
);

router.put(
  '/:id',
  verifyToken,
  isAdmin,
  uploadHotelPhotos.array('photos', 5),
  validate(updateHotelSchema),
  updateHotel
);

router.delete('/:id', verifyToken, isAdmin, deleteHotel);

export default router;
