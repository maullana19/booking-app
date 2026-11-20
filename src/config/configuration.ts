export default () => ({
  app: {
    env: process.env.NODE_ENV,
    port: Number(process.env.PORT) || 3040,
  },
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
});
