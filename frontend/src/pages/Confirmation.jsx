import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Confirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-gray-700">
          No pickup details found.
        </h1>
        <button
          onClick={() => navigate("/schedule")}
          className="mt-4 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-green-50">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Pickup Scheduled!
        </h2>
        <p className="text-gray-600 mb-6">
          Your e-waste pickup request has been successfully scheduled.
        </p>

        <div className="text-left space-y-2 mb-6">
          <p>
            <strong>Reference:</strong> {state.refNumber}
          </p>
          <p>
            <strong>Date:</strong> {state.date}
          </p>
          <p>
            <strong>Time:</strong> {state.time}
          </p>
          <p>
            <strong>Address:</strong> {state.address}
          </p>
        </div>

        <button
          onClick={() => navigate("/schedule")}
          className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700"
        >
          Schedule Another Pickup
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
