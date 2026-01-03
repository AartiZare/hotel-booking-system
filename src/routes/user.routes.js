import { Router } from 'express';
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  getMyProfile,
  updateMyProfile,
  listUsers,
  updateUserStatus,
  getUserById
} from '../controllers/user.controller.js';

import { validate } from '../middlewares/validate.middleware.js';
import {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validations/user.validations.js';

import { verifyToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/resend-otp', validate(resendOtpSchema), resendOtp);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, updateMyProfile);

router.get('/', verifyToken, isAdmin, listUsers);
router.get('/:id', verifyToken, isAdmin, getUserById);
router.patch('/:id/status', verifyToken, isAdmin, updateUserStatus);

export default router;
