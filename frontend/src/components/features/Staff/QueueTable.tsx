import React from 'react';
import { QueueEntry } from '../../../api/queue';
import Button from '../../ui/Button';

interface QueueTableProps {
  queue: QueueEntry[];
  onServe: (id: number) => Promise<void>;
  onReorder: (id: number, action: 'UP' | 'DOWN' | 'TOP' | 'BOTTOM') => Promise<void>;
}

const QueueTable: React.FC<QueueTableProps> = ({ queue, onServe, onReorder }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider">#</th>
            <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Ticket</th>
            <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider">People</th>
            <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Joined</th>
            <th className="p-4 font-bold text-gray-500 uppercase text-xs tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {queue.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-12 text-center text-gray-400 italic">The queue is currently empty.</td>
            </tr>
          ) : (
            queue.map((entry, index) => (
              <tr key={entry.id} className="hover:bg-gray-50 transition-colors group">
                <td className="p-4">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${index === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {index + 1}
                  </span>
                </td>
                <td className="p-4 font-bold text-lg text-gray-800">{entry.ticketNumber}</td>
                <td className="p-4 font-medium">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm">{entry.peopleCount} People</span>
                </td>
                <td className="p-4 text-sm text-gray-400">
                  {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 items-center">
                    <div className="flex bg-gray-100 rounded-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => onReorder(entry.id, 'TOP')}
                        disabled={index === 0}
                        variant="ghost"
                        className="px-2 py-1 text-blue-600 font-bold text-xs"
                        title="Move to Top"
                      >
                        TOP
                      </Button>
                      <Button
                        onClick={() => onReorder(entry.id, 'UP')}
                        disabled={index === 0}
                        variant="ghost"
                        className="px-2 py-1"
                        title="Move Up"
                      >
                        ↑
                      </Button>
                      <Button
                        onClick={() => onReorder(entry.id, 'DOWN')}
                        disabled={index === queue.length - 1}
                        variant="ghost"
                        className="px-2 py-1"
                        title="Move Down"
                      >
                        ↓
                      </Button>
                      <Button
                        onClick={() => onReorder(entry.id, 'BOTTOM')}
                        disabled={index === queue.length - 1}
                        variant="ghost"
                        className="px-2 py-1 text-gray-600 font-bold text-xs"
                        title="Move to Bottom"
                      >
                        BTM
                      </Button>
                    </div>
                    <Button
                      onClick={() => onServe(entry.id)}
                      variant="secondary"
                      className="px-4 py-2 text-sm"
                    >
                      Serve
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QueueTable;
