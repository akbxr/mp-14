import { Request, Response } from 'express';
import { PointController } from '../controllers/point.controller';

jest.mock('../prisma', () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  pointTransaction: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
}));

const prisma = require('../prisma');
const pointController = new PointController();

const mockRequest = (body: any, user: any = {}) => ({ body, user } as Request);
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('PointController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addReferralPoints', () => {
    it('should add points successfully', async () => {
      prisma.$transaction.mockImplementation(async (callback: any) => {
        await callback(prisma);
      });

      const userId = 1;
      await pointController.addReferralPoints(userId);

      expect(prisma.pointTransaction.create).toHaveBeenCalledWith({
        data: {
          userId,
          points: 10000,
          expiresAt: expect.any(Date),
        },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { points: { increment: 10000 } },
      });
    });

    it('should handle errors', async () => {
      prisma.$transaction.mockImplementation(async () => {
        throw new Error('Database error');
      });

      const userId = 1;
      await expect(pointController.addReferralPoints(userId)).rejects.toThrow('Database error');
    });
  });

  describe('redeemPointsForTicket', () => {
    it('should return 401 if user is not authenticated', async () => {
      const req = mockRequest({}, {});
      const res = mockResponse();

      await pointController.redeemPointsForTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
    });

    it('should return 400 for invalid ticket price', async () => {
      const req = mockRequest({ ticketPrice: -100 }, { id: 1 });
      const res = mockResponse();

      await pointController.redeemPointsForTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid ticket price' });
    });

    it('should return 404 if user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const req = mockRequest({ ticketPrice: 100 }, { id: 1 });
      const res = mockResponse();

      await pointController.redeemPointsForTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should redeem points successfully', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        points: 10000,
        pointTransactions: [
          { points: 5000, expiresAt: new Date(Date.now() + 100000) },
          { points: 5000, expiresAt: new Date(Date.now() + 200000) },
        ],
      });

      prisma.$transaction.mockImplementation(async (callback: any) => {
        await callback(prisma);
      });

      const req = mockRequest({ ticketPrice: 8000 }, { id: 1 });
      const res = mockResponse();

      await pointController.redeemPointsForTicket(req, res);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { points: { decrement: 8000 } },
      });
      expect(prisma.pointTransaction.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          points: -8000,
          expiresAt: expect.any(Date),
        },
      });
      expect(res.json).toHaveBeenCalledWith({
        originalPrice: 8000,
        pointsRedeemed: 8000,
        finalPrice: 0,
        message: `Successfully redeemed 8000 points for a discount of IDR 8000. Final ticket price: IDR 0.`,
      });
    });

    it('should handle errors', async () => {
      prisma.user.findUnique.mockRejectedValue(new Error('Database error'));

      const req = mockRequest({ ticketPrice: 100 }, { id: 1 });
      const res = mockResponse();

      await pointController.redeemPointsForTicket(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error redeeming points for ticket', error: expect.any(Error) });
    });
  });
});