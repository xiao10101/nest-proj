export const configuration = () => ({
  app: {
    port: parseInt(process.env.PORT ?? '', 10) || 3000,
    env: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    db: process.env.REDIS_DB,
    maxRetriesPerRequest: process.env.MAX_RETRIES_PER_REQUEST,
    lazyConnect: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  pyament: {
    signKey: process.env.PAYMENT_SIGN_KEY,
  },
});
