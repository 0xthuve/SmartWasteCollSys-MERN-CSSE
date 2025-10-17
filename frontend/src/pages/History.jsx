// src/pages/History.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const History = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPickup, setEditingPickup] = useState(null);
  const [editForm, setEditForm] = useState({
    date: "",
    time: "",
    address: "",
    specialInstructions: ""
  });

  // API Base URL
  const API_BASE = "http://localhost:5000/api";

  // Fetch all pickup requests
  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/pickups`);
      // Handle both response formats
      const pickupsData = response.data.data || response.data;
      setPickups(Array.isArray(pickupsData) ? pickupsData : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pickups:", error);
      setLoading(false);
    }
  };

  // Update pickup request
  const updatePickup = async (id, updatedData) => {
    try {
      const response = await axios.put(`${API_BASE}/pickups/${id}`, updatedData);
      if (response.data.success) {
        await fetchPickups(); // Refresh the list
        setEditingPickup(null);
        alert("Pickup request updated successfully!");
      } else {
        alert("Update failed: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating pickup:", error);
      alert("Failed to update pickup request: " + (error.response?.data?.message || error.message));
    }
  };

  // Update pickup status
  const updateStatus = async (id, status) => {
    try {
      const response = await axios.put(`${API_BASE}/pickups/${id}/status`, { status });
      if (response.data.success) {
        await fetchPickups(); // Refresh the list
        alert(`Pickup status updated to ${status} successfully!`);
      } else {
        alert("Status update failed: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status: " + (error.response?.data?.message || error.message));
    }
  };

  // Delete pickup request
  const deletePickup = async (id) => {
    if (window.confirm("Are you sure you want to delete this pickup request?")) {
      try {
        const response = await axios.delete(`${API_BASE}/pickups/${id}`);
        if (response.data.success) {
          await fetchPickups(); // Refresh the list
          alert("Pickup request deleted successfully!");
        } else {
          alert("Delete failed: " + (response.data.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error deleting pickup:", error);
        alert("Failed to delete pickup request: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // Start editing a pickup
  const startEditing = (pickup) => {
    setEditingPickup(pickup);
    
    // Format date properly for input[type="date"]
    const pickupDate = new Date(pickup.date);
    const formattedDate = pickupDate.toISOString().split('T')[0];
    
    setEditForm({
      date: formattedDate,
      time: pickup.time,
      address: pickup.address,
      specialInstructions: pickup.specialInstructions || ""
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingPickup(null);
    setEditForm({
      date: "",
      time: "",
      address: "",
      specialInstructions: ""
    });
  };

  // Save edited pickup
  const saveEdit = async () => {
    if (!editForm.date || !editForm.time || !editForm.address) {
      alert("Please fill all required fields");
      return;
    }

    await updatePickup(editingPickup._id, editForm);
  };

  // Time slots for editing
  const timeSlots = [
    "09:00 - 11:00",
    "11:00 - 13:00",
    "13:00 - 15:00",
    "15:00 - 17:00",
    "17:00 - 19:00",
  ];

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      scheduled: "bg-blue-100 text-blue-800 border-blue-200",
      confirmed: "bg-purple-100 text-purple-800 border-purple-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: "✅",
      pending: "⏳",
      scheduled: "📅",
      confirmed: "✅",
      cancelled: "❌"
    };
    return icons[status] || "📋";
  };

  // Calculate statistics - FIXED
  // Get only completed Home Pickup requests
  const completedHomePickups = pickups.filter(item => 
    item.status === "completed" && item.method === "Home Pickup"
  );

  // Calculate total items recycled (sum of all quantities from completed home pickups)
  const totalItemsRecycled = completedHomePickups.reduce((sum, pickup) => {
    return sum + (pickup.totalQuantity || 0);
  }, 0);

  // Calculate total weight recycled (sum of all weights from completed home pickups)
  const totalWeightRecycled = completedHomePickups.reduce((sum, pickup) => {
    return sum + (pickup.totalWeight || 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your recycling history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            📋 Recycling History
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your recycling journey and environmental impact
          </p>
        </div>

        {/* Stats Overview - FIXED */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{pickups.length}</div>
            <div className="text-gray-600">Total Requests</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalItemsRecycled}</div>
            <div className="text-gray-600">Items Recycled</div>
            <p className="text-xs text-gray-500 mt-1">From completed home pickups</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{totalWeightRecycled.toFixed(1)}kg</div>
            <div className="text-gray-600">Weight Recycled</div>
            <p className="text-xs text-gray-500 mt-1">From completed home pickups</p>
          </div>
        </div>

        {/* History List */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
            <h2 className="text-2xl font-bold flex items-center">
              📊 Your Recycling Activities
            </h2>
            <p className="text-green-100 mt-1">
              {pickups.length} request{pickups.length !== 1 ? 's' : ''} total • {completedHomePickups.length} completed home pickup{completedHomePickups.length !== 1 ? 's' : ''}
            </p>
          </div>

          {pickups.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No requests found</h3>
              <p className="text-gray-500 mb-6">You don't have any recycling requests yet.</p>
              <Link
                to="/schedule"
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition"
              >
                Make Your First Request
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pickups.map((pickup) => (
                <div key={pickup._id} className="p-6 hover:bg-gray-50 transition-all">
                  {editingPickup && editingPickup._id === pickup._id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">Edit Pickup Request</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={saveEdit}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot *</label>
                          <select
                            value={editForm.time}
                            onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            required
                          >
                            <option value="">Select time</option>
                            {timeSlots.map(slot => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                          <textarea
                            value={editForm.address}
                            onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                            rows="2"
                            className="w-full border border-gray-300 rounded-lg p-2"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                          <textarea
                            value={editForm.specialInstructions}
                            onChange={(e) => setEditForm({...editForm, specialInstructions: e.target.value})}
                            rows="2"
                            className="w-full border border-gray-300 rounded-lg p-2"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(pickup.status)}`}>
                            {getStatusIcon(pickup.status)} {pickup.status}
                          </span>
                          <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {pickup.reference}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold text-gray-800">{pickup.method}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(pickup.date).toLocaleDateString()} at {pickup.time}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">📍 {pickup.address}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Items:</strong> {pickup.items?.length || 0} types
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Quantity:</strong> {pickup.totalQuantity || 0} items
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Weight:</strong> {pickup.totalWeight || 0} kg
                            </p>
                            {pickup.status === "completed" && pickup.method === "Home Pickup" && (
                              <p className="text-sm font-semibold text-green-600">
                                ✓ Counted in recycling stats
                              </p>
                            )}
                          </div>
                        </div>

                        {pickup.specialInstructions && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                              <strong>Notes:</strong> {pickup.specialInstructions}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-col space-y-2 min-w-[150px]">
                        <button 
                          onClick={() => startEditing(pickup)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                        >
                          Edit
                        </button>
                        
                        {pickup.status === "pending" && (
                          <button 
                            onClick={() => updateStatus(pickup._id, "cancelled")}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                          >
                            Cancel
                          </button>
                        )}
                        
                        <button 
                          onClick={() => deletePickup(pickup._id)}
                          className="border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Environmental Impact */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6 text-center">🌍 Your Environmental Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">{Math.round(totalWeightRecycled * 2.5)}kg</div>
              <div className="text-green-100">CO2 Reduced</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{Math.round(totalWeightRecycled * 0.8)}L</div>
              <div className="text-green-100">Water Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{Math.round(totalWeightRecycled * 1.2)}kWh</div>
              <div className="text-green-100">Energy Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{totalItemsRecycled}</div>
              <div className="text-green-100">Items Recycled</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <Link
            to="/schedule"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 inline-block"
          >
            ♻️ Schedule New Collection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default History;