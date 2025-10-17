// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

// Page imports
import Home from "./pages/Home";
import RequestCollection from "./pages/RequestCollection";
import SchedulePickup from "./pages/SchedulePickup";
import Confirmation from "./pages/Confirmation";
import History from "./pages/History";
import DropoffCenters from "./pages/DropoffCenters";

import "./App.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header (always visible) */}
        <Header />

        {/* Page Content */}
        <main className="flex-grow">
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Recycling collection options */}
            <Route path="/request" element={<RequestCollection />} />

            {/* Schedule pickup form - FIXED PATH */}
            <Route path="/schedule" element={<SchedulePickup />} />

            {/* Confirmation page after scheduling */}
            <Route path="/confirmation" element={<Confirmation />} />

            {/* User's past pickup history */}
            <Route path="/history" element={<History />} />

            {/* Dropoff center info */}
            <Route path="/dropoff" element={<DropoffCenters />} />

            {/* Optional: fallback route */}
            <Route
              path="*"
              element={
                <div className="text-center py-20 text-gray-600">
                  <h1 className="text-3xl font-bold mb-2">
                    404 - Page Not Found
                  </h1>
                  <p>Sorry, the page you're looking for doesn't exist.</p>
                </div>
              }
            />
          </Routes>
        </main>

        {/* Footer (always visible) */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
