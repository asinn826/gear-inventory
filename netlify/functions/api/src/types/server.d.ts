import { Express } from 'express';

declare module 'express' {
  interface Request {
    user?: any;
  }
}

declare const app: Express;

export { app };
