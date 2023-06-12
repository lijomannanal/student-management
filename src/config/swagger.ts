import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({
  path: path.resolve('./', `.env.${process.env.NODE_ENV as string}`),
});

const { SERVER_HOST, PORT } = process.env;

export const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Student management API',
      version: '1.0.0',
      description: 'Apis to manage student accounts',
    },
    host: `${SERVER_HOST as string}:${PORT as string}`,
    basePath: '/',
    produces: ['application/json'],
  },
  apis: ['src/routes/*.ts'],
};
export default options;
