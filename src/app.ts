import Express from 'express';
import * as dotenv from 'dotenv';
import * as path from 'path';
import compression from 'compression';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes/router';
import globalErrorHandler from './middlewares/globalErrorHandler';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerOptions from './config/swagger';
dotenv.config({
  path: path.resolve('./', `.env.${process.env.NODE_ENV as string}`),
});

const swaggerSpec = swaggerJSDoc(swaggerOptions);

const App = Express();

App.use(compression());
App.use(cors());
App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));
App.use('/api', router);
App.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
App.use(globalErrorHandler);

export default App;
