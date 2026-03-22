import React from 'react';
import { useKiosk } from '../hooks/useKiosk';
import IssueTicketForm from '../components/features/Kiosk/IssueTicketForm';
import TicketResult from '../components/features/Kiosk/TicketResult';
import CancelTicketForm from '../components/features/Kiosk/CancelTicketForm';

const KioskPage: React.FC = () => {
  const {
    totalWaiting,
    issuedTicket,
    loading,
    message,
    setIssuedTicket,
    issueTicket,
    cancelTicket
  } = useKiosk();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-600">Waitlist Machine</h2>

      {issuedTicket ? (
        <TicketResult 
          ticket={issuedTicket} 
          onDone={() => setIssuedTicket(null)} 
        />
      ) : (
        <IssueTicketForm 
          totalWaiting={totalWaiting} 
          onIssue={issueTicket} 
          loading={loading} 
        />
      )}

      {message.text && (
        <div className={`mt-6 p-4 rounded-lg text-center font-medium shadow-sm border ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-100' 
            : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {message.text}
        </div>
      )}

      {!issuedTicket && (
        <CancelTicketForm 
          onCancel={cancelTicket} 
          loading={loading} 
        />
      )}

      <div className="mt-12 text-center">
        <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors text-sm underline underline-offset-4">
          Back to Selection
        </a>
      </div>
    </div>
  );
};

export default KioskPage;
