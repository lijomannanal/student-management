import { type Dialect, Sequelize } from 'sequelize';
import Logger from './logger';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve('./', `.env.${process.env.NODE_ENV as string}`),
});

const LOG = new Logger('database.js');

const { DB_HOST, DB_DIALECT = 'mysql', DB_SCHEMA, DB_USER, DB_PW, DB_LOG_LEVEL, ENABLE_DB_LOGS } = process.env;

const sequelizeConnection = new Sequelize(DB_SCHEMA as string, DB_USER as string, DB_PW, {
  host: DB_HOST,
  dialect: DB_DIALECT as Dialect,
  logging:
    ENABLE_DB_LOGS === '1'
      ? (msg) => {
          LOG[DB_LOG_LEVEL as 'info'](msg);
        }
      : false,
});

export default sequelizeConnection;
