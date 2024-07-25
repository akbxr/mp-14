import { useRouter } from 'next/navigation';

interface LoginReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginReminderModal: React.FC<LoginReminderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Login Required</h2>
        <p className="mb-4">You need to be logged in to purchase tickets.</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginReminderModal;
