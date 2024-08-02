import { Router } from 'express';
import EventController from '@/controllers/event.controller';
import { authorize, authenticate } from '@/middlewares/auth.middleware';

export class EventRouter {
  private router: Router;
  private eventController: EventController;

  constructor() {
    this.eventController = new EventController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/create-event',
      authenticate,
      authorize(['ORGANIZER']),
      this.eventController.createEvent,
    );

    this.router.get('/get-events', this.eventController.getEvents);
    this.router.get('/events/:id', this.eventController.getEventById);
  }

  getRouter(): Router {
    return this.router;
  }
}
