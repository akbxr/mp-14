'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Event {
  id: string;
  name: string;
  date: string;
  organizer: string;
  price: string;
  category: string;
}

const CATEGORIES = [
  { value: 'Music', label: 'Music' },
  { value: 'Tech', label: 'Technology' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Arts', label: 'Arts & Culture' },
  { value: 'Food', label: 'Food & Drink' },
  { value: 'Business', label: 'Business' },
];

const EventContent: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const eventsPerPage: number = 6;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/get-events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  const formatToRupiah = (price: string): string => {
    if (price === 'FREE') return 'GRATIS';
    return `Rp ${parseFloat(price.replace('$', '')).toLocaleString('id-ID')}`;
  };

  // Filter events based on search term and category
  const filteredEvents: Event[] = events.filter(
    (event) =>
      (event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === 'All' || event.category === selectedCategory),
  );

  // Pagination
  const indexOfLastEvent: number = currentPage * eventsPerPage;
  const indexOfFirstEvent: number = indexOfLastEvent - eventsPerPage;
  const currentEvents: Event[] = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent,
  );

  const paginate = (pageNumber: number): void => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Join thousands at top events worldwide.
      </h1>

      <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search events..."
            className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>
        <div>
          <select
            className="w-full md:w-auto p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedCategory}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedCategory(e.target.value)
            }
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentEvents.map((event: Event) => (
          <Link href={`/events/${event.id}`} key={event.id}>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
              <div className="p-4 text-white">
                <div className="flex justify-between items-center mb-2">
                  <span className="inline-block bg-white text-indigo-500 text-xs font-semibold px-2 py-1 rounded">
                    {formatToRupiah(event.price)}
                  </span>
                  <span className="inline-block bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                    {event.category}
                  </span>
                </div>
                <h2 className="text-lg font-semibold mb-1 truncate">
                  {event.name}
                </h2>
                <p className="text-sm mb-1">{event.date}</p>
                <p className="text-sm truncate">{event.organizer}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredEvents.length > eventsPerPage && (
        <div className="flex justify-center mt-8">
          {Array.from(
            { length: Math.ceil(filteredEvents.length / eventsPerPage) },
            (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors duration-200`}
              >
                {i + 1}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
};

export default EventContent;
