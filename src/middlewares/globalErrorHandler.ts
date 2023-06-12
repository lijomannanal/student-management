import ErrorBase from '../errors/ErrorBase';
import { type ErrorWithStatus } from '../types/custom';
import { type NextFunction, type Response, type Request } from 'express';

const globalErrorHandler = (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction): unknown => {
  if (res.headersSent) {
    next(err);
    return;
  }

  // Handling of body-parser content malformed error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({
      message: 'Malformed json',
    });
  }

  if (err instanceof ErrorBase) {
    const error = err;
    return res.status(error.getHttpStatusCode()).send({
      message: error.getMessage(),
    });
  } else {
    return res.status(500).send({
      message: 'Internal server error',
    });
  }
};

export default globalErrorHandler;
