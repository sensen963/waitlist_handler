import React, { useState } from 'react';

interface TicketLookupFormProps {
  onLookup: (ticketNumber: string) => void;
  initialTicketNumber: string;
}

const TicketLookupForm: React.FC<TicketLookupFormProps> = ({ onLookup, initialTicketNumber }) => {
  const [ticketNumber, setTicketNumber] = useState(initialTicketNumber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLookup(ticketNumber);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
      <p className="mb-4 text-gray-600">Enter your ticket number to check status</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={ticketNumber}
          onChange={(e) => setTicketNumber(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="T-001"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors"
        >
          Check
        </button>
      </div>
    </form>
  );
};

export default TicketLookupForm;
