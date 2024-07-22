import { Request, Response, Router } from 'express';
import { PrismaClient, User, UserRole } from '@prisma/client';

import prisma from '@/prisma';

class DashboardController {


  async getEvents(req: Request, res: Response) {
    try {
      const organizerId = req.user?.id;
      if (!organizerId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const events = await prisma.event.findMany({
        where: { organizerId },
        include: { attendees: true, transactions: true },
      });
      return res.status(200).json(events);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }
  };

  async getEventAttendees(req: Request, res: Response) {
    try {
      const organizerId = req.user?.id;
      if (!organizerId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const newRegistrations = await prisma.eventAttendee.findMany({
        where: {
          event: {
            organizerId: organizerId
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          event: {
            select: {
              name: true,
              date: true,
              location: true
            }
          },
          attendee: {
            select: {
              name: true,
              email: true
            }
          }
        },
        take: 50 // Limit to the 50 most recent registrations
      });

      const formattedRegistrations = newRegistrations.map(registration => ({
        registrationId: registration.id,
        eventId: registration.eventId,
        eventName: registration.event.name,
        eventDate: registration.event.date,
        eventLocation: registration.event.location,
        attendeeId: registration.attendeeId,
        attendeeName: registration.attendee.name,
        attendeeEmail: registration.attendee.email,
        registrationDate: registration.createdAt
      }));

      res.json(formattedRegistrations);
    } catch (error) {
      console.error('Error fetching new registrations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getEventTransactions(req: Request, res: Response) {
    try {
      const organizerId = req.user?.id;
      if (!organizerId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const transactions = await prisma.transaction.findMany({
        where: {
          event: {
            organizerId: organizerId
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          event: {
            select: {
              name: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          },
          tickets: {
            select: {
              type: true,
              price: true,
              quantity: true
            }
          }
        },
        take: 50 // Limit to the 50 most recent transactions
      });

      const formattedTransactions = transactions.map(transaction => ({
        transactionId: transaction.id,
        eventId: transaction.eventId,
        eventName: transaction.event.name,
        userId: transaction.userId,
        userName: transaction.user.name,
        userEmail: transaction.user.email,
        amount: transaction.amount,
        discountApplied: transaction.discountApplied,
        finalAmount: transaction.finalAmount,
        status: transaction.status,
        usedReferralCode: transaction.usedReferralCode,
        transactionDate: transaction.createdAt,
        tickets: transaction.tickets.map(ticket => ({
          type: ticket.type,
          price: ticket.price,
          quantity: ticket.quantity
        }))
      }));

      res.json(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStatistics(req: Request, res: Response) {
    const { range = '1y' } = req.query;
    const startDate = getDateRanges(range);

    function getDateRanges(range: any) {
      const now = new Date();
      switch (range) {
        case '1y':
          return new Date(now.setFullYear(now.getFullYear() - 1));
        case '30d':
          return new Date(now.setDate(now.getDate() - 30));
        case '7d':
          return new Date(now.setDate(now.getDate() - 7));
        case '1d':
          return new Date(now.setHours(0, 0, 0, 0));
        default:
          return new Date(now.setFullYear(now.getFullYear() - 1));
      }
    }

    try {
      const organizerId = req.user?.id;

      const events = await prisma.event.findMany({
        where: {
          organizerId,
          date: {
            gte: startDate,
          },
        },
        include: {
          attendees: true,
          transactions: true,
        },
      });

      const chartData = events.map(event => ({
        name: event.name,
        date: event.date,
        attendees: event.attendees.length,
        revenue: event.transactions.reduce((sum, transaction) => sum + transaction.finalAmount, 0),
      }));

      res.json(chartData);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: 'An error occurred while fetching statistics' });
    }
  }

}

export default DashboardController;