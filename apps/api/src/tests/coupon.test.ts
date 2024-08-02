import { PrismaClient } from '@prisma/client';
import { DiscountController } from '../controllers/discount.controller';

// Mock the Prisma client
jest.mock('@prisma/client', () => {
  const mockCreate = jest.fn();
  return {
    PrismaClient: jest.fn(() => ({
      discountCoupon: { create: mockCreate },
    })),
  };
});

describe('DiscountController', () => {
  let discountController: DiscountController;
  let mockPrismaCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaCreate = (new (PrismaClient as jest.Mock)()).discountCoupon.create;
    discountController = new DiscountController();
  });

  it('should create a discount coupon', async () => {
    const userId = 1;
    const coupon = {
      id: 1,
      userId,
      code: 'ABCDEF',
      discount: 10,
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaCreate.mockResolvedValue(coupon);

    await discountController.createDiscountCoupon(userId);

    expect(mockPrismaCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId,
        discount: 10,
        expiresAt: expect.any(Date),
      }),
    });
  });

  it('should throw an error if creating a discount coupon fails', async () => {
    const userId = 1;
    const error = new Error('Database error');

    mockPrismaCreate.mockRejectedValue(error);

    await expect(discountController.createDiscountCoupon(userId)).rejects.toThrow('Database error');

    expect(mockPrismaCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId,
        discount: 10,
        expiresAt: expect.any(Date),
      }),
    });
  });
});