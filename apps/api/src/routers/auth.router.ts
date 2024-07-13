import { AuthController } from '@/controllers/auth.contorller';
import { Router } from 'express';

export class AuthRouter {
  private router: Router;
  private authController: AuthController;

  constructor() {
    this.authController = new AuthController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/auth/login', this.authController.login);
    this.router.post('/auth/register', this.authController.register);
  }

  getRouter(): Router {
    return this.router;
  }
}
