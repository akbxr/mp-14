'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Event {
  id: number;
  title: string;
  organizer: string;
  date: string;
  category: string;
  price: string;
  image: string;
}

const EventContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const eventsPerPage: number = 6;

  // Dummy data
  const events: Event[] = [
    {
      id: 1,
      title: 'NextJs',
      organizer: 'Yusuf Chatab',
      date: 'Tue, Dec 19, 6:48 PM',
      category: 'Next.js',
      price: 'FREE',
      image: '/images/js-mastery.jpg',
    },
    {
      id: 2,
      title: 'GitHub 2024',
      organizer: 'Yusuf Chatab',
      date: 'Thu, Dec 19, 11:25 AM',
      category: 'Next.js',
      price: '$999',
      image: '/images/github-universe.jpg',
    },
    {
      id: 3,
      title: 'React Conference 2024',
      organizer: 'React Team',
      date: 'Sat, Jan 15, 9:00 AM',
      category: 'React',
      price: '$599',
      image: '/images/react-conf.jpg',
    },
    {
      id: 4,
      title: 'Vue.js Workshop',
      organizer: 'Vue Masters',
      date: 'Wed, Feb 1, 2:00 PM',
      category: 'Vue.js',
      price: '$299',
      image: '/images/vue-workshop.jpg',
    },
    {
      id: 5,
      title: 'Angular Deep Dive',
      organizer: 'ng-conf',
      date: 'Mon, Mar 10, 10:00 AM',
      category: 'Angular',
      price: '$499',
      image: '/images/angular-dive.jpg',
    },
    {
      id: 6,
      title: 'TypeScript Mastery',
      organizer: 'TS Guru',
      date: 'Fri, Apr 5, 1:00 PM',
      category: 'TypeScript',
      price: '$399',
      image: '/images/ts-mastery.jpg',
    },
  ];

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
        Trust by Thousands of Events
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
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
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
                    ? 'bg-blue-500 text-white'
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
