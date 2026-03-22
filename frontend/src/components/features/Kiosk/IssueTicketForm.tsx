import React, { useState } from 'react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Card from '../../ui/Card';

interface IssueTicketFormProps {
  totalWaiting: number;
  onIssue: (peopleCount: number, phoneNumber: string) => Promise<void>;
  loading: boolean;
}

const IssueTicketForm: React.FC<IssueTicketFormProps> = ({ totalWaiting, onIssue, loading }) => {
  const [peopleCount, setPeopleCount] = useState(2);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onIssue(peopleCount, phoneNumber);
  };

  return (
    <Card className="max-w-md mx-auto">
      <p className="text-lg mb-6 text-center text-gray-600">
        Currently Waiting: <span className="font-bold text-3xl text-blue-600">{totalWaiting} Groups</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Number of people"
          type="number"
          min="1"
          value={peopleCount}
          onChange={(e) => setPeopleCount(parseInt(e.target.value))}
          required
        />
        <Input
          label="Phone number (for authentication)"
          type="tel"
          placeholder="09012345678"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full mt-4" 
          size="lg"
        >
          {loading ? 'Processing...' : 'Issue Ticket'}
        </Button>
      </form>
    </Card>
  );
};

export default IssueTicketForm;
