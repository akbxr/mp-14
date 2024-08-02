import { Request, Response } from 'express';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: User;
}

class TransactionController {
  async createTransaction(req: AuthenticatedRequest, res: Response) {
    console.log('Transaction creation attempt started');
    console.log('Request body:', req.body);
    console.log('Authenticated user:', req.user);

    const user = req.user;

    if (!user) {
      console.log('Unauthorized access attempt');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const { eventId, ticketId, quantity, couponCode } = req.body;
      console.log('Parsed request data:', {
        eventId,
        ticketId,
        quantity,
        couponCode,
      });

      // Validate input
      if (!eventId || !ticketId || !quantity) {
        const missingFields = [];
        if (!eventId) missingFields.push('eventId');
        if (!ticketId) missingFields.push('ticketId');
        if (!quantity) missingFields.push('quantity');
        console.log('Missing fields:', missingFields);
        return res.status(400).json({
          error: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }

      const eventIdNumber = Number(eventId);
      const ticketIdNumber = Number(ticketId);
      const quantityNumber = Number(quantity);

      if (
        isNaN(eventIdNumber) ||
        isNaN(ticketIdNumber) ||
        isNaN(quantityNumber)
      ) {
        console.log('Invalid numeric fields');
        return res.status(400).json({ error: 'Invalid numeric fields' });
      }

      console.log('Starting database transaction');
      const result = await prisma.$transaction(async (tx) => {
        console.log('Finding ticket:', ticketIdNumber);
        const ticket = await tx.ticket.findUnique({
          where: { id: ticketIdNumber },
          include: {
            event: {
              include: {
                promotions: {
                  where: {
                    startDate: { lte: new Date() },
                    endDate: { gte: new Date() },
                  },
                },
              },
            },
          },
        });

        console.log('Found ticket:', ticket);

        if (!ticket) {
          console.log('Ticket not found');
          throw new Error('Ticket not found');
        }

        if (ticket.quantity < quantityNumber) {
          console.log('Not enough tickets available');
          throw new Error('Not enough tickets available');
        }

        console.log('Calculating price and discounts');
        let amount = ticket.price * quantityNumber;
        let discountApplied = 0;
        let finalAmount = amount;

        if (!ticket.event.isFreeEvent) {
          console.log('Processing paid event logic');
          if (ticket.event.promotions.length > 0) {
            const promotion = ticket.event.promotions[0];
            discountApplied = Math.floor(
              (amount * promotion.discountPercent) / 100,
            );
            console.log('Promotion applied:', {
              discountPercent: promotion.discountPercent,
              discountApplied,
            });
          }

          if (couponCode) {
            console.log('Processing coupon code:', couponCode);
            const coupon = await tx.discountCoupon.findFirst({
              where: {
                code: couponCode,
                userId: user.id,
                isUsed: false,
                expiresAt: { gte: new Date() },
              },
            });

            console.log('Found coupon:', coupon);

            if (coupon) {
              discountApplied += coupon.discount;
              await tx.discountCoupon.update({
                where: { id: coupon.id },
                data: { isUsed: true },
              });
              console.log('Coupon applied:', {
                additionalDiscount: coupon.discount,
              });
            }
          }

          finalAmount = Math.max(amount - discountApplied, 0);
        }

        console.log('Creating transaction record');
        const transaction = await tx.transaction.create({
          data: {
            eventId: ticket.eventId,
            userId: user.id,
            amount: ticket.event.isFreeEvent ? 0 : amount,
            discountApplied: ticket.event.isFreeEvent ? 0 : discountApplied,
            finalAmount: ticket.event.isFreeEvent ? 0 : finalAmount,
            status: 'COMPLETED',
            usedReferralCode: couponCode,
          },
        });

        console.log('Created transaction:', transaction);

        console.log('Updating ticket quantity');
        const updatedTicket = await tx.ticket.update({
          where: { id: ticketIdNumber },
          data: {
            quantity: { decrement: quantityNumber },
          },
          include: { event: true },
        });

        console.log('Updated ticket:', updatedTicket);

        console.log('Checking/creating EventAttendee record');
        const existingAttendee = await tx.eventAttendee.findUnique({
          where: {
            eventId_attendeeId: {
              eventId: ticket.eventId,
              attendeeId: user.id,
            },
          },
        });

        if (!existingAttendee) {
          await tx.eventAttendee.create({
            data: {
              eventId: ticket.eventId,
              attendeeId: user.id,
            },
          });
          console.log('Created new EventAttendee record');
        } else {
          console.log('EventAttendee record already exists');
        }

        return { transaction, updatedTicket };
      });

      console.log('Transaction completed successfully');
      return res.status(201).json({
        message: 'Transaction completed successfully',
        transaction: result.transaction,
        updatedTicketQuantity: result.updatedTicket.quantity,
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      return res.status(500).json({
        error: 'Failed to create transaction',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default TransactionController;
