'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface Event {
  id: string;
  name: string;
  date: string;
  organizer: string;
  price: string;
  category: string;
  description: string;
}

const EventPage = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/get-event/${eventId}`,
        );
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  if (!event) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
          <p className="text-lg mb-4">{event.date}</p>
          <p className="text-lg mb-4">Organizer: {event.organizer}</p>
          <p className="text-lg mb-4">
            Price:{' '}
            {event.price === 'FREE'
              ? 'GRATIS'
              : `Rp ${parseFloat(event.price.replace('$', '')).toLocaleString('id-ID')}`}
          </p>
          <p className="text-lg mb-4">Category: {event.category}</p>
          <p className="text-lg mb-4">{event.description}</p>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
