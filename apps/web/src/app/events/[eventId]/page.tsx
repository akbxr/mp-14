'use client';

import { useState } from 'react';
import { events } from '../../ constants';
import Image from 'next/image';
import LoginReminderModal from '../../../components/ui/loginReminder';
import PaymentModal from '../../../components/ui/paymentModal';
import { useAuth } from '../../utils/AuthContext';

export default function EventPage({ params }: { params: { eventId: string } }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  const eventId = parseInt(params.eventId, 10);
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return <div className="container mx-auto px-4 py-8">Event not found</div>;
  }

  const handleBuyNow = () => {
    if (isLoggedIn) {
      setIsPaymentModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div className="container px-4 py-10 lg:w-5/6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative w-full h-64">
              <Image
                src={event.image}
                alt={event.title}
                layout="fill"
                objectFit="cover"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold mt-6 mb-4">{event.title}</h1>
          <p className="text-gray-600 mb-6">
            {event.organizer} is hosting a {event.category} event. Join us for
            an exciting opportunity to learn and network!
          </p>
          <h2 className="text-2xl font-semibold mb-4">Event Details</h2>
          <p className="text-gray-600 mb-2">
            <strong>Date:</strong> {event.date}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Category:</strong> {event.category}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Organizer:</strong> {event.organizer}
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-4">About This Event</h2>
          <p className="text-gray-600 mb-4">
            This {event.category} event promises to be an enriching experience
            for all attendees. Whether you're a beginner or an expert, you'll
            find valuable insights and opportunities to expand your knowledge.
          </p>
        </div>
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Ticket Information</h2>
            <div className="bg-indigo-500 text-white rounded-lg p-4 mb-4">
              <p className="text-xl font-bold">{event.price}</p>
              <p className="text-sm">Standard Admission</p>
            </div>
            <button
              onClick={handleBuyNow}
              className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-300"
            >
              Buy Now
            </button>
            <button className="w-full mt-4 bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600 transition duration-300">
              Add to Calendar
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">Event Information</h3>
            <p className="text-gray-600 mb-2">
              <strong>Released on:</strong> {event.date.split(',')[1].trim()}
            </p>
            <p className="text-gray-600 mb-2">
              <strong>Category:</strong> {event.category}
            </p>
            <p className="text-gray-600">
              <strong>Organizer:</strong> {event.organizer}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Share this event:</h3>
        <div className="flex space-x-4">
          <a href="#" className="text-blue-600 hover:text-blue-800">
            LinkedIn
          </a>
          <a href="#" className="text-blue-400 hover:text-blue-600">
            Twitter
          </a>
          <a href="#" className="text-blue-800 hover:text-blue-900">
            Facebook
          </a>
        </div>
      </div>

      <LoginReminderModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        eventTitle={event.title}
        price={event.price}
      />
    </div>
  );
}
