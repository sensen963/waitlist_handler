import React from 'react';
import { QueueEntry } from '../../../api/queue';
import CancelForm from './CancelForm';

interface UserStatusProps {
  entry: QueueEntry;
  onCancel: (phoneNumber: string) => Promise<boolean>;
  loading: boolean;
}

const UserStatus: React.FC<UserStatusProps> = ({ entry, onCancel, loading }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-orange-500 animate-in fade-in zoom-in duration-300">
      <p className="text-gray-500 mb-2">Ticket Number</p>
      <p className="text-5xl font-black mb-8">{entry.ticketNumber}</p>

      <div className="p-6 bg-orange-50 rounded-xl mb-8">
        <p className="text-lg text-orange-800">Your position in queue:</p>
        <p className="text-6xl font-bold text-orange-600 mt-2">
          {entry.groupsAhead} <span className="text-2xl font-normal">groups ahead</span>
        </p>
        <p className="text-sm text-gray-500 mt-4">(Including yourself)</p>
      </div>

      <CancelForm onCancel={onCancel} loading={loading} />
    </div>
  );
};

export default UserStatus;
