import React, { useState } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Card from '../../ui/Card';

interface CancelTicketFormProps {
  onCancel: (ticketNumber: string, phoneNumber: string) => Promise<boolean>;
  loading: boolean;
}

const CancelTicketForm: React.FC<CancelTicketFormProps> = ({ onCancel, loading }) => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onCancel(ticketNumber, phoneNumber);
    if (success) {
      setTicketNumber('');
      setPhoneNumber('');
    }
  };

  return (
    <Card title="Cancel your entry" className="max-w-md mx-auto mt-12">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Ticket Number (e.g., T-001)"
          value={ticketNumber}
          onChange={(e) => setTicketNumber(e.target.value)}
          required
        />
        <Input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <Button 
          type="submit" 
          variant="danger" 
          disabled={loading} 
          className="w-full"
        >
          {loading ? 'Processing...' : 'Cancel Entry'}
        </Button>
      </form>
    </Card>
  );
};

export default CancelTicketForm;
