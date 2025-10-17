import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import SchedulePickupBG from "../assets/SchedulePickup.png";

const SchedulePickup = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const method = state?.method || "Home Pickup";

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(false);

  const eWasteItems = [
    { id: 1, name: "Old Mobile Phones", icon: "📱" },
    { id: 2, name: "Laptops & Computers", icon: "💻" },
    { id: 3, name: "Cables and Chargers", icon: "🔌" },
    { id: 4, name: "Televisions & Monitors", icon: "📺" },
    { id: 5, name: "Printers & Scanners", icon: "🖨️" },
    { id: 6, name: "Batteries", icon: "🔋" },
    { id: 7, name: "Small Appliances", icon: "⚡" },
    { id: 8, name: "Other E-waste", icon: "🔧" },
  ];

  const timeSlots = [
    "09:00 - 11:00",
    "11:00 - 13:00",
    "13:00 - 15:00",
    "15:00 - 17:00",
    "17:00 - 19:00",
  ];

  const getNextWeekDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const handleItemToggle = (item) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      return exists
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, { ...item, quantity: 1, weight: 0 }];
    });
  };

  const updateItemQuantity = (id, quantity) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
      )
    );
  };

  const updateItemWeight = (id, weight) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, weight: Math.max(0, weight) } : i
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date || !time || items.length === 0 || !address) {
      alert("⚠️ Please fill all required fields.");
      return;
    }

    const refNumber = "REF" + Math.floor(100000 + Math.random() * 900000);
    const totalWeight = items.reduce((t, i) => t + (i.weight || 0), 0);
    const totalQuantity = items.reduce((t, i) => t + (i.quantity || 0), 0);

    const pickupData = {
      method,
      date,
      time,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        weight: i.weight,
      })),
      refNumber,
      totalWeight,
      totalQuantity,
      address,
      specialInstructions,
    };

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/pickups", pickupData);
      setLoading(false);

      // redirect to confirmation page
      navigate("/confirmation", { state: pickupData });
    } catch (error) {
      setLoading(false);
      console.error("Error scheduling pickup:", error);
      alert("❌ Failed to schedule pickup. Please try again later.");
    }
  };

  const totalWeight = items.reduce((t, i) => t + (i.weight || 0), 0);
  const totalQuantity = items.reduce((t, i) => t + (i.quantity || 0), 0);

  return (
    <div
      className="min-h-screen bg-cover bg-center py-10"
      style={{ backgroundImage: `url(${SchedulePickupBG})` }}
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">Schedule {method}</h1>
            <p className="text-green-100">
              Choose your preferred date, time, and items for collection
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div>
              <label className="block text-lg font-semibold mb-3">
                📍 Collection Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your address"
                className="w-full border-2 rounded-xl p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-lg font-semibold mb-3">
                📅 Pickup Date
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {getNextWeekDates().map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDate(d)}
                    className={`p-4 rounded-xl border-2 transition ${
                      date === d
                        ? "border-green-500 bg-green-50 text-green-700 font-bold"
                        : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                    }`}
                  >
                    {new Date(d).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-lg font-semibold mb-3">
                ⏰ Time Slot
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    className={`p-4 rounded-xl border-2 transition ${
                      time === slot
                        ? "border-green-500 bg-green-50 text-green-700 font-bold"
                        : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Items */}
            <div>
              <label className="block text-lg font-semibold mb-3">
                🔋 Select E-waste Items
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eWasteItems.map((item) => {
                  const selected = items.find((i) => i.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemToggle(item)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                        selected
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">
                          {item.icon} {item.name}
                        </span>
                        {selected && (
                          <span className="text-green-500 font-bold">✓</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Item details */}
            {items.length > 0 && (
              <div>
                <h3 className="font-bold mb-3 text-gray-700">
                  📊 Item Details
                </h3>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">
                        {item.icon} {item.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleItemToggle(item)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemQuantity(
                              item.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full border rounded-lg p-2"
                        />
                      </div>
                      <div>
                        <label className="text-sm">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={item.weight}
                          onChange={(e) =>
                            updateItemWeight(
                              item.id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full border rounded-lg p-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Special instructions */}
            <div>
              <label className="block text-lg font-semibold mb-3">
                📝 Special Instructions
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows="3"
                placeholder="Any special notes..."
                className="w-full border-2 rounded-xl p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {loading ? "⏳ Submitting..." : "🚚 Confirm Pickup"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchedulePickup;
