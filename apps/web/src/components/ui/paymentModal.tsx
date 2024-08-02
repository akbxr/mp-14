import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../app/utils/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  price: string;
  eventId: number;
  ticketId: number;
  isFreeEvent: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  eventTitle,
  price,
  eventId,
  ticketId,
  isFreeEvent,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();

  console.log('PaymentModal props:', {
    eventTitle,
    price,
    eventId,
    ticketId,
    isFreeEvent,
  });

  useEffect(() => {
    console.log('PaymentModal mounted/updated with ticketId:', ticketId);
  }, [ticketId]);

  if (!isOpen) return null;

  const handlePayment = async () => {
    console.log('Handling payment with ticketId:', ticketId);
    if (!isLoggedIn) {
      setError('You must be logged in to make a purchase.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log('Sending transaction request with data:', {
        eventId,
        ticketId,
        quantity,
        couponCode,
      });

      const response = await axios.post(
        'http://localhost:8000/api/transaction/create',
        {
          eventId,
          ticketId,
          quantity,
          couponCode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log('Transaction response:', response);

      if (response.status === 201) {
        console.log('Transaction successful');
        alert('Transaction completed successfully!');
        onClose();
      } else {
        console.log('Unexpected response status:', response.status);
        setError('Transaction failed. Please try again.');
      }
    } catch (err) {
      console.error('Transaction error:', err);
      if (axios.isAxiosError(err) && err.response) {
        console.error('Error response:', err.response.data);
        setError(
          err.response.data.error ||
            'An error occurred during the transaction.',
        );
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          {isFreeEvent ? 'Register for Event' : 'Purchase Ticket'}
        </h2>
        <p className="mb-2">Event: {eventTitle}</p>
        <p className="mb-4">Price: {price}</p>
        <div className="mb-4">
          <label className="block mb-2">Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              console.log('Quantity changed:', e.target.value);
              setQuantity(Number(e.target.value));
            }}
            min="1"
            className="w-full p-2 border rounded"
          />
        </div>
        {!isFreeEvent && (
          <div className="mb-4">
            <label className="block mb-2">Coupon Code (optional):</label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                console.log('Coupon code changed:', e.target.value);
                setCouponCode(e.target.value);
              }}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              console.log('Cancel clicked');
              onClose();
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log('Pay Now / Register clicked');
              handlePayment();
            }}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            disabled={loading || !isLoggedIn}
          >
            {loading ? 'Processing...' : isFreeEvent ? 'Register' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
