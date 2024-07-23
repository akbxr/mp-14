import { PointController } from '@/controllers/point.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { Router } from 'express';
export class PointRouter {
  private router: Router;
  private pointController: PointController;

  constructor() {
    this.pointController = new PointController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/point/redeem', authenticate, this.pointController.redeemPointsForTicket);
  }

  getRouter(): Router {
    return this.router;
  }
}