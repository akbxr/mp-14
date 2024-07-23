'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { events, Event } from '../app/ constants';

const EventContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const eventsPerPage: number = 6;

  // Filter events based on search term and category
  const filteredEvents: Event[] = events.filter(
    (event) =>
      (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        Join thousands at top tech events worldwide.
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
            <option value="Next.js">Next.js</option>
            <option value="React">React</option>
            <option value="Vue.js">Vue.js</option>
            <option value="Angular">Angular</option>
            <option value="TypeScript">TypeScript</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentEvents.map((event: Event) => (
          <Link href={`/events/${event.id}`} key={event.id}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
              <div className="relative w-full h-40">
                <Image
                  src={event.image}
                  alt={event.title}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="inline-block bg-indigo-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    {event.price}
                  </span>
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                    {event.category}
                  </span>
                </div>
                <h2 className="text-lg font-semibold mb-1 truncate">
                  {event.title}
                </h2>
                <p className="text-sm text-gray-600 mb-1">{event.date}</p>
                <p className="text-sm text-gray-500 truncate">
                  {event.organizer}
                </p>
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
