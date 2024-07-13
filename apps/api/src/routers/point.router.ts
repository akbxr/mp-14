import { PointController } from '@/controllers/point.controller';
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
    this.router.post('/point/redeem', this.pointController.redeemPointsForTicket);
  }

  getRouter(): Router {
    return this.router;
  }
}