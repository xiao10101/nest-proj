import Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default("development"),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required()
}).options({ allowUnknown: true })