import App from './app';
import Logger from './config/logger';
import DbConnection from './config/db';
const MAX_RETRY = 5;
const { PORT = '8080', TEST_PORT } = process.env;
const LOG = new Logger('server.js');

const listen = async (): Promise<unknown> => {
  const port = (process.env.NODE_ENV === 'test' ? TEST_PORT : PORT) as string;
  return await new Promise((resolve, reject) => {
    App.listen(port)
      .once('listening', () => {
        resolve(`Application started at http://localhost:${port}`);
      })
      .once('error', reject);
  });
};

const startApplication = async (retryCount: number): Promise<unknown> => {
  return await new Promise((resolve, reject) => {
    DbConnection.sync()
      .then(listen)
      .then(resolve)
      .catch((error) => {
        LOG.error(error as string);
        const nextRetryCount = retryCount - 1;
        if (nextRetryCount > 0) {
          setTimeout(() => {
            void startApplication(nextRetryCount).catch((error) => {
              reject(error);
            });
          }, 3000);
        } else {
          reject(error);
        }
      });
  });
};

startApplication(MAX_RETRY)
  .then((res) => {
    LOG.info(res as string);
  })
  .catch(() => {
    LOG.error('Unable to start application');
  });

export default App;
