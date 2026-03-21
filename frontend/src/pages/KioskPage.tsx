import { useState, useEffect } from "react";
import { queueApi, QueueEntry } from "../api/queue";

const KioskPage = () => {
  const [totalWaiting, setTotalWaiting] = useState(0);
  const [peopleCount, setPeopleCount] = useState(2);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [issuedTicket, setIssuedTicket] = useState<QueueEntry | null>(null);
  const [cancelTicket, setCancelTicket] = useState("");
  const [cancelPhone, setCancelPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const { totalWaiting } = await queueApi.getStats();
      setTotalWaiting(totalWaiting);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const handleIssueTicket = async () => {
    if (!phoneNumber) {
      setMessage({ text: "Please enter a phone number", type: "error" });
      return;
    }
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const ticket = await queueApi.issueTicket(peopleCount, phoneNumber);
      setIssuedTicket(ticket);
      setPhoneNumber("");
      fetchStats();
    } catch (error: any) {
      setMessage({ text: error.response?.data?.error || "Failed to issue ticket", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTicket || !cancelPhone) {
      setMessage({ text: "Please enter ticket and phone number", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await queueApi.cancelEntry(cancelTicket, cancelPhone);
      setMessage({ text: "Entry cancelled successfully", type: "success" });
      setCancelTicket("");
      setCancelPhone("");
      fetchStats();
    } catch (error: any) {
      setMessage({ text: error.response?.data?.error || "Failed to cancel entry", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Waitlist Machine</h2>

      {issuedTicket ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-green-500 text-center animate-in fade-in duration-500">
          <h3 className="text-2xl font-bold text-green-600 mb-4">Ticket Issued!</h3>
          <p className="text-gray-500 mb-2">Your Ticket Number</p>
          <p className="text-6xl font-black mb-6">{issuedTicket.ticketNumber}</p>
          <div className="p-4 bg-green-50 rounded-xl mb-6">
            <p className="text-green-800">Groups ahead of you:</p>
            <p className="text-4xl font-bold">{issuedTicket.groupsAhead} <span className="text-xl font-normal text-green-700">groups</span></p>
          </div>
          <button
            onClick={() => setIssuedTicket(null)}
            className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
          <p className="text-xs text-gray-400 mt-4">Scan QR on printed ticket (Simulated: use #user?t={issuedTicket.ticketNumber})</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <p className="text-lg mb-6 text-center text-gray-600">Currently Waiting: <span className="font-bold text-3xl text-blue-600">{totalWaiting} Groups</span></p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Number of people</label>
              <input
                type="number"
                value={peopleCount}
                onChange={(e) => setPeopleCount(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Phone number (for authentication)</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="09012345678"
              />
            </div>
            <button
              onClick={handleIssueTicket}
              disabled={loading}
              className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-md mt-4 disabled:bg-blue-300"
            >
              {loading ? "Processing..." : "Issue Ticket"}
            </button>
          </div>
        </div>
      )}

      {message.text && (
        <div className={`mt-4 p-3 rounded-lg text-center font-medium ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="mt-12 p-6 bg-white rounded-xl shadow-md border border-gray-100">
        <h3 className="text-xl font-bold mb-4 text-center">Cancel your entry</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={cancelTicket}
            onChange={(e) => setCancelTicket(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="Ticket Number (e.g., T-001)"
          />
          <input
            type="tel"
            value={cancelPhone}
            onChange={(e) => setCancelPhone(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="Phone Number"
          />
          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full bg-red-500 text-white p-3 rounded-lg font-bold hover:bg-red-600 transition-colors disabled:bg-red-300"
          >
            {loading ? "Processing..." : "Cancel Entry"}
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <a href="#" className="text-gray-500 underline text-sm hover:text-gray-700">Back to Selection</a>
      </div>
    </div>
  );
};

export default KioskPage;
