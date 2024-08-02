import { PrismaClient, User, UserRole } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../prisma';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
export class PointController {

  async addReferralPoints(userId: number) {
    const points = 10000; // 10,000 points for each referral
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3); // Points expire after 3 months

    console.log(`Attempting to add ${points} points to user ${userId}`);

    try {
      await prisma.$transaction(async (prisma) => {
        const pointTransaction = await prisma.pointTransaction.create({
          data: {
            userId,
            points,
            expiresAt,
          },
        });
        console.log(`Point transaction created: ${JSON.stringify(pointTransaction)}`);

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { points: { increment: points } },
        });
      });

      console.log(`Successfully added ${points} points to user ${userId}`);
    } catch (error) {
      console.error('Error adding referral points:', error);
      throw error;
    }
  }

  async redeemPointsForTicket(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { ticketPrice } = req.body;

    if (!ticketPrice || typeof ticketPrice !== 'number' || ticketPrice <= 0) {
      return res.status(400).json({ message: 'Invalid ticket price' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { pointTransactions: true },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const currentDate = new Date();
      const validPoints = user.pointTransactions
        .filter(pt => pt.expiresAt > currentDate)
        .reduce((sum, pt) => sum + pt.points, 0);

      const pointsToRedeem = Math.min(validPoints, ticketPrice);
      const finalPrice = ticketPrice - pointsToRedeem;

      await prisma.$transaction(async (prisma) => {
        // Update user points
        await prisma.user.update({
          where: { id: userId },
          data: {
            points: {
              decrement: pointsToRedeem
            }
          },
        });

        await prisma.pointTransaction.create({
          data: {
            userId,
            points: -pointsToRedeem,
            expiresAt: new Date(currentDate.getTime() + 90 * 24 * 60 * 60 * 1000), // 3 months from now
          },
        });
      });

      res.json({
        originalPrice: ticketPrice,
        pointsRedeemed: pointsToRedeem,
        finalPrice: finalPrice,
        message: `Successfully redeemed ${pointsToRedeem} points for a discount of IDR ${pointsToRedeem}. Final ticket price: IDR ${finalPrice}.`
      });
    } catch (error) {
      console.error('Error redeeming points for ticket:', error);
      res.status(500).json({ message: 'Error redeeming points for ticket', error });
    }
  }

}