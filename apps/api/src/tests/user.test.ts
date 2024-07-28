import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import UserController from '../controllers/user.controller';

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});
jest.mock('bcrypt');

const prisma = new PrismaClient();
const mockRequest = (body: any, user: any = {}) => ({ body, user } as Request);
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
describe('UserController', () => {
  let userController: UserController;

  beforeEach(() => {
    userController = new UserController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return user data if user is found', async () => {
      const req = { params: { id: 1 } } as unknown as Request;
      const res = mockResponse();

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        email: 'test@test.com',
        name: 'Test User',
        role: 'CUSTOMER',
      });

      await userController.getUser(req, res);

      expect(res.json).toHaveBeenCalledWith({
        email: 'test@test.com',
        name: 'Test User',
        role: 'CUSTOMER',
      });
    });

    it('should return 404 if user is not found', async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 500 if there is an error fetching user', async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching user', error: expect.any(Error) });
    });
  });

  describe('updateUser', () => {
    it('should update user with valid data', async () => {
      const req = mockRequest({ name: 'Updated User', email: 'updated@test.com' }, { id: 1 });
      const res = mockResponse();

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 1,
        name: 'Updated User',
        email: 'updated@test.com',
        password: 'hashedPassword',
        role: 'CUSTOMER',
        points: 100,
        referralCode: 'ABC123',
      });

      await userController.updateUser(req, res);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated User', email: 'updated@test.com' },
        select: expect.any(Object),
      });
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
        name: 'Updated User',
        email: 'updated@test.com',
        password: 'hashedPassword',
        role: 'CUSTOMER',
        points: 100,
        referralCode: 'ABC123',
      });
    });

    it('should return 400 if no fields are provided for update', async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'At least one field (name, email, or newPassword) must be provided for update' });
    });

    it('should return 404 if user is not found', async () => {
      const req = mockRequest({ currentPassword: 'password', newPassword: 'newPassword' }, { id: 1 });
      const res = mockResponse();

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found or password not set' });
    });

    it('should return 401 if current password is incorrect', async () => {
      const req = mockRequest({ currentPassword: 'wrongPassword', newPassword: 'newPassword' }, { id: 1 });
      const res = mockResponse();

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ password: 'hashedPassword' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Current password is incorrect' });
    });

    it('should return 500 if there is an error updating user', async () => {
      const req = mockRequest({ name: 'Updated User' }, { id: 1 });
      const res = mockResponse();

      (prisma.user.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error updating user', error: expect.any(Error) });
    });
  });
});