import { Router } from 'express';
import TransactionController from '@/controllers/transaction.controller';
import { authenticate } from '@/middlewares/auth.middleware';

export class TransactionRouter {
  private router: Router;
  private transactionController: TransactionController;

  constructor() {
    this.transactionController = new TransactionController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/transaction/create',
      authenticate,
      this.transactionController.createTransaction,
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
