import Joi from 'joi';

export const registerSchema = Joi.object({
    firstName: Joi.string().min(2).max(30).trim().required(),
    lastName: Joi.string().min(2).max(30).trim().required(),

    email: Joi.string().email().lowercase().required(),

    phoneNumber: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required(),

    password: Joi.string().min(6).required()
});

export const verifyOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required()
});

export const resendOtpSchema = Joi.object({
    email: Joi.string().email().required()
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

export const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string().min(6).required()
});

export const updateProfileSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).optional()
});

export const updateUserStatusSchema = Joi.object({
    status: Joi.boolean().required()
});