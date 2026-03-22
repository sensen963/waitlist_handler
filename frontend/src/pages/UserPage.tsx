import React from 'react';
import { useUserStatus } from '../hooks/useUserStatus';
import TicketLookupForm from '../components/features/User/TicketLookupForm';
import UserStatus from '../components/features/User/UserStatus';

const UserPage: React.FC = () => {
  const {
    ticketNumber,
    entry,
    loading,
    message,
    setMessage,
    fetchStatus,
    cancelPosition,
  } = useUserStatus();

  const handleRefresh = () => {
    if (entry) {
      fetchStatus(entry.ticketNumber);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto text-center">
      <h2 className="text-3xl font-bold mb-6 text-orange-600">Your Ticket Status</h2>

      {!entry && !message.text && (
        <TicketLookupForm
          initialTicketNumber={ticketNumber}
          onLookup={fetchStatus}
        />
      )}

      {entry && (
        <UserStatus
          entry={entry}
          onCancel={cancelPosition}
          loading={loading}
        />
      )}

      {message.text && (
        <div
          className={`mt-4 p-4 rounded-lg text-center font-medium ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
          {message.type === 'error' && (
            <button
              onClick={() => setMessage({ text: '', type: '' })}
              className="block mx-auto mt-2 underline text-sm"
            >
              Try again
            </button>
          )}
        </div>
      )}

      <div className="mt-8 text-center text-gray-500">
        <p className="text-sm">
          Please wait for your turn. Refresh to update.
        </p>
        <button
          onClick={handleRefresh}
          className="mt-4 text-orange-600 font-bold hover:underline"
          disabled={!entry || loading}
        >
          Refresh Status
        </button>
        <a
          href="#"
          className="underline block mt-6 text-xs hover:text-gray-700"
        >
          Back to Selection
        </a>
      </div>
    </div>
  );
};

export default UserPage;
