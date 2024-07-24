import request from 'supertest';
import express from 'express';
import { AuthController } from '../controllers/auth.contorller';

describe('AuthController', () => {
  let app: express.Express;
  let authController: AuthController;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    authController = new AuthController();
    app.post('/register', authController.register);
    app.post('/login', authController.login);
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        email: 'test@test.com',
        password: 'password',
        name: 'Test User',
        role: 'CUSTOMER',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
  });

  it('should not register a user with an existing email', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        email: 'test@test.com',
        password: 'password',
        name: 'Test User',
        role: 'CUSTOMER',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  it('should login a user', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'password',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
  });

  it('should not login a user with invalid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});


