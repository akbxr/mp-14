'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import LoginReminderModal from './loginReminder';
import PaymentModal from './paymentModal';
import { useAuth } from '../../app/utils/AuthContext';

interface Ticket {
  id: number;
  type: string;
  price: number;
  quantity: number;
  description?: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  organizer: string;
  tickets: Ticket[];
  category: string;
  description: string;
  location: string;
  capacity: number;
  isFreeEvent: boolean;
}

const EventPage: React.FC = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginReminder, setShowLoginReminder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setError('No event ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<Event>(
          `http://localhost:8000/api/events/${eventId}`,
        );
        setEvent(response.data);
      } catch (err) {
        setError('Error fetching event. Please try again later.');
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const formatToRupiah = (price: number): string => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePurchaseClick = (ticket: Ticket | null = null) => {
    console.log('Purchase clicked for ticket:', ticket);
    if (!isLoggedIn) {
      setShowLoginReminder(true);
    } else {
      setSelectedTicket(ticket);
      setShowPaymentModal(true);
    }
    console.log('Selected ticket after state update:', ticket);
  };

  const handleLoginReminderClose = () => {
    setShowLoginReminder(false);
  };

  const handlePaymentModalClose = () => {
    setShowPaymentModal(false);
    setSelectedTicket(null);
  };

  const groupTickets = (tickets: Ticket[]): Ticket[] => {
    const groupedTickets = tickets.reduce(
      (acc, ticket) => {
        const key = `${ticket.type}-${ticket.price}`;
        if (!acc[key]) {
          acc[key] = { ...ticket, quantity: 0 };
        }
        acc[key].quantity += ticket.quantity;
        return acc;
      },
      {} as Record<string, Ticket>,
    );

    return Object.values(groupedTickets);
  };

  useEffect(() => {
    console.log('Selected ticket changed:', selectedTicket);
  }, [selectedTicket]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!event) return <div>Event not found</div>;

  const groupedTickets = groupTickets(event.tickets);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 text-white">
              <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
              <p className="mb-4">{event.description}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Event Details</h2>
            <p className="mb-2">
              <strong>Date:</strong> {formatDate(event.date)}
            </p>
            <p className="mb-2">
              <strong>Location:</strong> {event.location}
            </p>
            <p className="mb-2">
              <strong>Organizer:</strong> {event.organizer}
            </p>
            <p className="mb-2">
              <strong>Category:</strong> {event.category}
            </p>
            <p className="mb-2">
              <strong>Capacity:</strong> {event.capacity}
            </p>
          </div>
        </div>

        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Ticket Options</h2>
            <div className="space-y-4">
              {event.isFreeEvent ? (
                <div className="p-4 bg-blue-100 rounded-md">
                  <h3 className="font-bold text-lg">FREE</h3>
                  <p className="text-sm text-gray-600">This is a free event</p>
                  <button
                    onClick={() => handlePurchaseClick()}
                    className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300"
                  >
                    Register
                  </button>
                </div>
              ) : groupedTickets.length > 0 ? (
                groupedTickets.map((ticket, index) => (
                  <div
                    key={index}
                    className={`p-4 ${index === 0 ? 'bg-blue-100' : 'bg-gray-100'} rounded-md`}
                  >
                    <h3 className="font-bold text-lg">
                      {ticket.type} - {formatToRupiah(ticket.price)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {ticket.description || `${ticket.type} ticket`}
                    </p>
                    <p className="text-sm text-gray-600">
                      Available: {ticket.quantity}
                    </p>
                    <button
                      onClick={() => handlePurchaseClick(ticket)}
                      className="mt-2 w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300"
                    >
                      Purchase
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-blue-100 rounded-md">
                  <h3 className="font-bold text-lg">
                    Ticket information not available
                  </h3>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Event Information</h2>
            <p className="mb-2">
              <strong>Released on:</strong> {formatDate(event.date)}
            </p>
            <p className="mb-2">
              <strong>Last Updated on:</strong>{' '}
              {formatDate(new Date().toISOString())}
            </p>
            <p className="mb-2">
              <strong>Category:</strong> {event.category}
            </p>
            <p className="mb-2">
              <strong>Organizer:</strong> {event.organizer}
            </p>
          </div>
        </div>
      </div>

      <LoginReminderModal
        isOpen={showLoginReminder}
        onClose={handleLoginReminderClose}
      />

      {showPaymentModal && selectedTicket && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentModalClose}
          eventTitle={event.name}
          price={
            event.isFreeEvent ? 'FREE' : formatToRupiah(selectedTicket.price)
          }
          eventId={parseInt(eventId)}
          ticketId={selectedTicket.id}
          isFreeEvent={event.isFreeEvent}
        />
      )}
    </div>
  );
};

export default EventPage;
