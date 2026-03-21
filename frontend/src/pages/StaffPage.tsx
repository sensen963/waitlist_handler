import { useState, useEffect } from "react";
import { queueApi, QueueEntry } from "../api/queue";

const StaffPage = () => {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const data = await queueApi.getQueue();
      setQueue(data);
    } catch (error) {
      console.error("Failed to fetch queue", error);
    }
  };

  const handleServe = async (id: number) => {
    if (!confirm("Mark this group as served?")) return;
    try {
      await queueApi.serveEntry(id);
      fetchQueue();
    } catch (error) {
      alert("Failed to serve entry");
    }
  };

  const handleReorder = async (id: number, action: "UP" | "DOWN" | "TOP" | "BOTTOM") => {
    setLoading(true);
    try {
      const updatedQueue = await queueApi.reorder(id, action);
      setQueue(updatedQueue);
    } catch (error) {
      alert("Failed to reorder");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("This will CLEAR ALL waiting groups. Are you sure? (End of Day reset)")) return;
    try {
      await queueApi.resetQueue();
      fetchQueue();
    } catch (error) {
      alert("Failed to reset queue");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-green-600">Staff Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Manage waiting groups and reorder if needed.</p>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={handleReset}
            className="text-xs bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 px-3 py-2 rounded-lg font-medium transition-colors"
          >
            Reset Day
          </button>
          <div className="text-right border-l pl-4 border-gray-200">
            <p className="text-gray-500 text-sm">Current Waiting</p>
            <p className="text-3xl font-bold text-green-600">{queue.length} Groups</p>
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}>
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
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${index === 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
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
                        <button
                          onClick={() => handleReorder(entry.id, "TOP")}
                          disabled={index === 0}
                          className="px-2 py-1 hover:bg-white rounded-md transition-colors text-blue-600 font-bold text-xs disabled:opacity-30"
                          title="Move to Top"
                        >
                          TOP
                        </button>
                        <button
                          onClick={() => handleReorder(entry.id, "UP")}
                          disabled={index === 0}
                          className="px-2 py-1 hover:bg-white rounded-md transition-colors disabled:opacity-30"
                          title="Move Up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleReorder(entry.id, "DOWN")}
                          disabled={index === queue.length - 1}
                          className="px-2 py-1 hover:bg-white rounded-md transition-colors disabled:opacity-30"
                          title="Move Down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => handleReorder(entry.id, "BOTTOM")}
                          disabled={index === queue.length - 1}
                          className="px-2 py-1 hover:bg-white rounded-md transition-colors text-gray-600 font-bold text-xs disabled:opacity-30"
                          title="Move to Bottom"
                        >
                          BTM
                        </button>
                      </div>
                      <button
                        onClick={() => handleServe(entry.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm transition-colors whitespace-nowrap"
                      >
                        Serve
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center text-gray-500">
        <a href="#" className="underline text-sm hover:text-gray-700">Back to Selection</a>
      </div>
    </div>
  );
};

export default StaffPage;
