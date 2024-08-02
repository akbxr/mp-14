import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { AuthController } from '../controllers/auth.contorller';

jest.mock('@prisma/client');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('nodemailer');
jest.mock('crypto');
jest.mock('../controllers/discount.controller');
jest.mock('../controllers/point.controller');

const prisma = new PrismaClient();
const mockRequest = (body: any) => ({ body } as Request);
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(() => {
    authController = new AuthController();
  });


  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const req = mockRequest({
      email: 'test@test.com',
      password: 'password',
      name: 'Test User',
      role: 'CUSTOMER',
    });
    const res = mockResponse();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (crypto.randomBytes as jest.Mock).mockReturnValue({ toString: () => 'verificationToken' });
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: 1, email: 'test@test.com' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: jest.fn().mockResolvedValue(true),
    });

    await authController.register(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    expect(prisma.user.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User registered. Please check your email to verify your account.',
    });
  });

  it('should not register a user with an existing email', async () => {
    const req = mockRequest({
      email: 'test@test.com',
      password: 'password',
      name: 'Test User',
      role: 'CUSTOMER',
    });
    const res = mockResponse();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 });

    await authController.register(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
  });

  it('should register a user with a referral code', async () => {
    const req = mockRequest({
      email: 'test@test.com',
      password: 'password',
      name: 'Test User',
      role: 'CUSTOMER',
      referralCode: 'REF123',
    });
    const res = mockResponse();

    (prisma.user.findUnique as jest.Mock).mockImplementation(({ where: { email, referralCode } }) => {
      if (email) return null;
      if (referralCode) return { id: 2 };
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
    (crypto.randomBytes as jest.Mock).mockReturnValue({ toString: () => 'verificationToken' });
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: 1, email: 'test@test.com' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: jest.fn().mockResolvedValue(true),
    });

    await authController.register(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { referralCode: 'REF123' } });
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    expect(prisma.user.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User registered. Please check your email to verify your account.',
    });
  });

  it('should handle registration errors', async () => {
    const req = mockRequest({
      email: 'test@test.com',
      password: 'password',
      name: 'Test User',
      role: 'CUSTOMER',
    });
    const res = mockResponse();

    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error registering user', error: new Error('Database error') });
  });

  it('should login a user successfully', async () => {
    const req = mockRequest({
      email: 'test@test.com',
      password: 'password',
    });
    const res = mockResponse();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: 'hashedpassword',
      isVerified: true,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('token');

    await authController.login(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      user: expect.any(Object),
      token: 'token',
    }));
  });

  it('should not login a user with invalid credentials', async () => {
    const req = mockRequest({
      email: 'test@test.com',
      password: 'wrongpassword',
    });
    const res = mockResponse();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      isVerified: true,
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await authController.login(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('should not login a user without email verification', async () => {
    const req = mockRequest({
      email: 'test@test.com',
      password: 'password',
    });
    const res = mockResponse();

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: 'hashedPassword',
      isVerified: false,
    });

    await authController.login(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Please verify your email before logging in' });
  });

  it('should verify email successfully', async () => {
    const req = { params: { token: 'verificationToken' } } as unknown as Request;
    const res = mockResponse();

    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      verificationToken: 'verificationToken',
      referredById: 2,
    });
    (prisma.user.update as jest.Mock).mockResolvedValue(true);
    (authController.pointController.addReferralPoints as jest.Mock).mockResolvedValue(true);
    (authController.discountController.createDiscountCoupon as jest.Mock).mockResolvedValue(true);

    await authController.verifyEmail(req, res);

    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { verificationToken: 'verificationToken' } });
    expect(prisma.user.update).toHaveBeenCalled();
    expect(authController.pointController.addReferralPoints).toHaveBeenCalledWith(2);
    expect(authController.discountController.createDiscountCoupon).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email verified successfully. You can now log in.' });
  });

  it('should not verify email with invalid token', async () => {
    const req = { params: { token: 'invalidToken' } } as unknown as Request;
    const res = mockResponse();

    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

    await authController.verifyEmail(req, res);

    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { verificationToken: 'invalidToken' } });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid verification token' });
  });

  it('should handle email verification errors', async () => {
    const req = { params: { token: 'verificationToken' } } as unknown as Request;
    const res = mockResponse();

    (prisma.user.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

    await authController.verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error verifying email', error: new Error('Database error') });
  });
});