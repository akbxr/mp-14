import { Request, Response } from 'express';
import { User } from '@prisma/client';
import prisma from '@/prisma';

interface AuthenticatedRequest extends Request {
  user?: User;
}
class EventController {
  async createEvent(req: AuthenticatedRequest, res: Response) {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const organizerId = req.user?.id;
      if (!organizerId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        name,
        description,
        date,
        location,
        category,
        isFreeEvent,
        capacity,
        tickets,
        promotion,
      } = req.body;

      // Create the event
      const event = await prisma.event.create({
        data: {
          name,
          description,
          date: new Date(date),
          location,
          category,
          isFreeEvent,
          capacity,
          organizerId,
        },
      });

      // Create tickets for the event if it's not free
      if (!isFreeEvent && tickets && tickets.length > 0) {
        await prisma.ticket.createMany({
          data: tickets.map((ticket: any) => ({
            eventId: event.id,
            type: ticket.type,
            price: ticket.price,
            quantity: ticket.quantity,
            description: ticket.description,
          })),
        });
      }

      // Create promotion for the event if provided
      if (promotion) {
        await prisma.promotion.create({
          data: {
            eventId: event.id,
            discountPercent: promotion.discountPercent,
            startDate: new Date(promotion.startDate),
            endDate: new Date(promotion.endDate),
          },
        });
      }

      return res
        .status(201)
        .json({ message: 'Event created successfully', event });
    } catch (error) {
      console.error('Error creating event:', error);
      return res.status(500).json({ error: 'Failed to create event' });
    }
  }

  async getEvents(req: Request, res: Response) {
    try {
      const events = await prisma.event.findMany({
        include: {
          organizer: {
            select: {
              name: true,
            },
          },
          tickets: {
            select: {
              price: true,
            },
          },
          promotions: true,
        },
      });

      const formattedEvents = events.map((event) => ({
        id: event.id,
        name: event.name,
        date: event.date.toISOString(),
        organizer: event.organizer.name,
        price: event.isFreeEvent
          ? 0
          : Math.min(...event.tickets.map((t) => t.price)),
        category: event.category,
        isFreeEvent: event.isFreeEvent,
        promotion:
          event.promotions.length > 0
            ? {
                discountPercent: event.promotions[0].discountPercent,
                startDate: event.promotions[0].startDate.toISOString(),
                endDate: event.promotions[0].endDate.toISOString(),
              }
            : null,
      }));

      return res.status(200).json(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }
  }

  async getEventById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        include: {
          organizer: {
            select: {
              name: true,
            },
          },
          tickets: {
            select: {
              type: true,
              price: true,
              quantity: true,
              description: true,
            },
          },
        },
      });

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const formattedEvent = {
        id: event.id,
        name: event.name,
        date: event.date.toISOString(),
        organizer: event.organizer.name,
        category: event.category,
        description: event.description,
        location: event.location,
        capacity: event.capacity,
        isFreeEvent: event.isFreeEvent,
        tickets: event.tickets.map((ticket) => ({
          type: ticket.type,
          price: ticket.price,
          quantity: ticket.quantity,
          description: ticket.description,
        })),
      };

      return res.status(200).json(formattedEvent);
    } catch (error) {
      console.error('Error fetching event:', error);
      return res.status(500).json({ error: 'Failed to fetch event' });
    }
  }
}

export default EventController;
