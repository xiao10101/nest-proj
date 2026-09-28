export const configuration = () => ({
  app: {
    port: parseInt(process.env.PORT ?? '', 10) || 3000,
    env: process.env.NODE_ENV
  },
  database: {
    url: process.env.DATABASE_URL
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT)
  }
})