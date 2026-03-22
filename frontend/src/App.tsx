import { useState, useEffect } from "react";
import KioskPage from "./pages/KioskPage";
import UserPage from "./pages/UserPage";
import StaffPage from "./pages/StaffPage";

function App() {
  const [view, setView] = useState<"kiosk" | "user" | "staff" | "home">("home");

  // Basic "routing" based on hash for simplicity
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (["kiosk", "user", "staff"].includes(hash)) {
        setView(hash as "kiosk" | "user" | "staff");
      } else {
        setView("home");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Check initial hash
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {view === "home" && (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <h1 className="text-4xl font-bold text-blue-600 mb-8">Queue Creator</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full px-4">
            <a href="#kiosk" className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all">
              <span className="text-5xl mb-4">🎫</span>
              <span className="text-xl font-semibold text-center">Waitlist Machine (Kiosk)</span>
            </a>
            <a href="#staff" className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-green-500 transition-all">
              <span className="text-5xl mb-4">📋</span>
              <span className="text-xl font-semibold text-center">Staff Operation Screen</span>
            </a>
            <a href="#user" className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-orange-500 transition-all">
              <span className="text-5xl mb-4">📱</span>
              <span className="text-xl font-semibold text-center">User View</span>
            </a>
          </div>
        </div>
      )}

      {view === "kiosk" && <KioskPage />}
      {view === "user" && <UserPage />}
      {view === "staff" && <StaffPage />}
    </div>
  );
}

export default App;
