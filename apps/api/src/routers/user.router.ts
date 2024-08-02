import UserController from '@/controllers/user.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { Router } from 'express';

export class UserRouter {
  private router: Router;
  private userController: UserController;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.put('/user/profile', authenticate, this.userController.updateUser);
    this.router.get('/user/profile', authenticate, this.userController.getUser);
  }

  getRouter(): Router {
    return this.router;
  }
}