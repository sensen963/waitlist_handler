import React from 'react';
import { useQueueManagement } from '../hooks/useQueueManagement';
import QueueTable from '../components/features/Staff/QueueTable';
import Button from '../components/ui/Button';

const StaffPage: React.FC = () => {
  const {
    queue,
    loading,
    serveEntry,
    reorder,
    resetQueue
  } = useQueueManagement();

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-green-600">Staff Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Manage waiting groups and reorder if needed.</p>
        </div>
        <div className="flex gap-4 items-center">
          <Button
            onClick={resetQueue}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-600 bg-gray-100 px-3"
          >
            Reset Day
          </Button>
          <div className="text-right border-l pl-4 border-gray-200">
            <p className="text-gray-500 text-sm">Current Waiting</p>
            <p className="text-3xl font-bold text-green-600">{queue.length} Groups</p>
          </div>
        </div>
      </div>

      <div className={`transition-opacity ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <QueueTable 
          queue={queue} 
          onServe={serveEntry} 
          onReorder={reorder} 
        />
      </div>

      <div className="mt-8 text-center text-gray-500">
        <a href="#" className="underline text-sm hover:text-gray-700">Back to Selection</a>
      </div>
    </div>
  );
};

export default StaffPage;
