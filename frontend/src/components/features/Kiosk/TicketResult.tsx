import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import { QueueEntry } from '../../../api/queue';

interface TicketResultProps {
  ticket: QueueEntry;
  onDone: () => void;
}

const TicketResult: React.FC<TicketResultProps> = ({ ticket, onDone }) => {
  const getTicketUrl = (ticketNumber: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#user?t=${ticketNumber}`;
  };

  return (
    <Card variant="success" className="max-w-md mx-auto text-center animate-in fade-in duration-500">
      <h3 className="text-2xl font-bold text-green-600 mb-4">Ticket Issued!</h3>
      <p className="text-gray-500 mb-2">Your Ticket Number</p>
      <p className="text-6xl font-black mb-6">{ticket.ticketNumber}</p>
      
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-white border-2 border-gray-100 rounded-lg shadow-inner">
          <QRCodeSVG value={getTicketUrl(ticket.ticketNumber)} size={120} />
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mb-6">Scan to track your position in line</p>
      
      <div className="p-4 bg-green-50 rounded-xl mb-6">
        <p className="text-green-800">Groups ahead of you:</p>
        <p className="text-4xl font-bold">
          {ticket.groupsAhead} <span className="text-xl font-normal text-green-700">groups</span>
        </p>
      </div>
      
      <Button onClick={onDone} className="w-full">
        Done
      </Button>
    </Card>
  );
};

export default TicketResult;
