import { useState, useEffect } from "react";
import { queueApi, QueueEntry } from "../api/queue";

const UserPage = () => {
  const [ticketNumber, setTicketNumber] = useState("");
  const [entry, setEntry] = useState<QueueEntry | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    // Try to get ticket from URL (e.g. #user?t=T-001)
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.split("?")[1]);
    const t = params.get("t");
    if (t) {
      setTicketNumber(t);
      fetchStatus(t);
    }
  }, []);

  const fetchStatus = async (t: string) => {
    setLoading(true);
    try {
      const data = await queueApi.getStatus(t);
      setEntry(data);
    } catch (error: any) {
      const errorData = error.response?.data?.error;
      const errorMsg = Array.isArray(errorData) 
        ? errorData.map((i: any) => i.message).join(", ")
        : (errorData || "Ticket not found");
      setMessage({ text: errorMsg, type: "error" });
      setEntry(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!phoneNumber) {
      setMessage({ text: "Please enter your phone number", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await queueApi.cancelEntry(ticketNumber, phoneNumber);
      setMessage({ text: "Cancelled successfully", type: "success" });
      setEntry(null);
    } catch (error: any) {
      const errorData = error.response?.data?.error;
      const errorMsg = Array.isArray(errorData) 
        ? errorData.map((i: any) => i.message).join(", ")
        : (errorData || "Failed to cancel");
      setMessage({ text: errorMsg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto text-center">
      <h2 className="text-3xl font-bold mb-6 text-orange-600">Your Ticket Status</h2>

      {!entry && !message.text && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
          <p className="mb-4">Enter your ticket number to check status</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="T-001"
            />
            <button
              onClick={() => fetchStatus(ticketNumber)}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors"
            >
              Check
            </button>
          </div>
        </div>
      )}

      {entry && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border-t-8 border-orange-500 animate-in fade-in zoom-in duration-300">
          <p className="text-gray-500 mb-2">Ticket Number</p>
          <p className="text-5xl font-black mb-8">{entry.ticketNumber}</p>

          <div className="p-6 bg-orange-50 rounded-xl mb-8">
            <p className="text-lg text-orange-800">Your position in queue:</p>
            <p className="text-6xl font-bold text-orange-600 mt-2">
              {entry.groupsAhead} <span className="text-2xl font-normal">groups ahead</span>
            </p>
            <p className="text-sm text-gray-500 mt-4">(Including yourself)</p>
          </div>

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
        </div>
      )}

      {message.text && (
        <div className={`mt-4 p-4 rounded-lg text-center font-medium ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
          {message.type === "error" && (
            <button onClick={() => setMessage({ text: "", type: "" })} className="block mx-auto mt-2 underline text-sm">Try again</button>
          )}
        </div>
      )}

      <div className="mt-8 text-center text-gray-500">
        <p className="text-sm">Please wait for your turn. Refresh to update.</p>
        <button
          onClick={() => entry && fetchStatus(entry.ticketNumber)}
          className="mt-4 text-orange-600 font-bold hover:underline"
        >
          Refresh Status
        </button>
        <a href="#" className="underline block mt-6 text-xs hover:text-gray-700">Back to Selection</a>
      </div>
    </div>
  );
};

export default UserPage;
