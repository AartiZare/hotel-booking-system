import Joi from 'joi';

export const createHotelSchema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().optional(),
    city: Joi.string().required(),
    address: Joi.string().optional(),
    defaultPrice: Joi.number().positive().required(),

    latitude: Joi.number().required(),
    longitude: Joi.number().required()
});

export const updateHotelSchema = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().optional(),
    city: Joi.string().optional(),
    address: Joi.string().optional(),
    defaultPrice: Joi.number().positive().optional(),

    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),

    specialPricesToAdd: Joi.array().items(
        Joi.object({
            startDate: Joi.date().required(),
            endDate: Joi.date().greater(Joi.ref('startDate')).required(),
            price: Joi.number().positive().required()
        })
    ).optional(),

    specialPricesToRemove: Joi.array().items(
        Joi.string().hex().length(24)
    ).optional()
});

export const searchHotelSchema = Joi.object({
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).required(),
    page: Joi.number().default(1),
    limit: Joi.number().default(10)
});
