// components/PaymentModal.tsx
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  price: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  eventTitle,
  price,
}) => {
  if (!isOpen) return null;

  const handlePayment = () => {
    // Implement payment logic here
    alert('Payment successful!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Purchase Ticket</h2>
        <p className="mb-2">Event: {eventTitle}</p>
        <p className="mb-4">Price: {price}</p>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Card Number"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
