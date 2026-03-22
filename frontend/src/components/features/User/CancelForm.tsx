import React, { useState } from 'react';

interface CancelFormProps {
  onCancel: (phoneNumber: string) => Promise<boolean>;
  loading: boolean;
}

const CancelForm: React.FC<CancelFormProps> = ({ onCancel, loading }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleCancel = async () => {
    const success = await onCancel(phoneNumber);
    if (success) {
      setPhoneNumber('');
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <h3 className="font-bold text-gray-700 mb-4 text-left">Cancel Entry</h3>
      <div className="space-y-4">
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          placeholder="Phone number used at issue"
        />
        <button
          onClick={handleCancel}
          disabled={loading}
          className="w-full bg-red-100 text-red-600 p-3 rounded-lg font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Processing..." : "Cancel My Position"}
        </button>
      </div>
    </div>
  );
};

export default CancelForm;
