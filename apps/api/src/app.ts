import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction,
  Router,
} from 'express';
import cors from 'cors';
import { PORT } from './config';
import { AuthRouter } from './routers/auth.router';
import { PointRouter } from './routers/point.router';
import { DashboardRouter } from './routers/dashboard.router';
import { UserRouter } from './routers/user.router';
import { EventRouter } from './routers/event.router';
import { TransactionRouter } from './routers/transaction.router';

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(
      cors({
        origin: '*',
        credentials: true,
      }),
    );
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private handleError(): void {
    // not found
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.includes('/api/')) {
        res.status(404).send('Not found !');
      } else {
        next();
      }
    });

    // error
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes('/api/')) {
          console.error('Error : ', err.stack);
          res.status(500).send('Error !');
        } else {
          next();
        }
      },
    );
  }

  private routes(): void {
    const authRouter = new AuthRouter();
    const pointRouter = new PointRouter();
    const dashboardRouter = new DashboardRouter();
    const eventRouter = new EventRouter();
    const transactionRouter = new TransactionRouter();
    const userRouter = new UserRouter();

    this.app.use('/api', userRouter.getRouter());
    this.app.use('/api', pointRouter.getRouter());
    this.app.use('/api', authRouter.getRouter());
    this.app.use('/api', dashboardRouter.getRouter());
    this.app.use('/api', eventRouter.getRouter());
    this.app.use('/api', transactionRouter.getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/`);
    });
  }
}
