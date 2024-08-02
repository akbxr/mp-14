import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const generateReferralCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

export class DiscountController {
  async createDiscountCoupon(userId: number) {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3); // Coupon expires after 3 months

    console.log(`Attempting to create discount coupon for user ${userId}`);

    try {
      const coupon = await prisma.discountCoupon.create({
        data: {
          userId,
          code: generateReferralCode(),
          discount: 10, // 10% discount
          expiresAt,
        },
      });

      console.log(
        `Created discount coupon for user ${userId}: ${JSON.stringify(coupon)}`,
      );
    } catch (error) {
      console.error('Error creating discount coupon:', error);
      throw error;
    }
  }
}
