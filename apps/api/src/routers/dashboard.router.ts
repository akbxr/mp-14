import DashboardController from '@/controllers/dashboard.controller';
import { authorize, authenticate } from '@/middlewares/auth.middleware';
import { Router } from 'express';

export class DashboardRouter {
  private router: Router;
  private dashboardController: DashboardController;

  constructor() {
    this.dashboardController = new DashboardController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/dashboard/events', authenticate, authorize(['ORGANIZER']), this.dashboardController.getEvents);
    this.router.get('/dashboard/statistics', authenticate, authorize(['ORGANIZER']), this.dashboardController.getStatistics);
    this.router.get('/dashboard/attendees', authenticate, authorize(['ORGANIZER']), this.dashboardController.getEventAttendees);
    this.router.get('/dashboard/transactions', authenticate, authorize(['ORGANIZER']), this.dashboardController.getEventTransactions);
  }

  getRouter(): Router {
    return this.router;
  }
}