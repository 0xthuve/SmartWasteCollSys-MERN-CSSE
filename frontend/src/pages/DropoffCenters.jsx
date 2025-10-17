// src/pages/DropoffCenters.jsx
import React from "react";
import { Link } from "react-router-dom";

const DropoffCenters = () => {
  const centers = [
    {
      id: 1,
      name: "Central Recycling Hub",
      address: "123 Eco Avenue, Green City",
      hours: "Mon-Sun: 8:00 AM - 8:00 PM",
      contact: "+1 (555) 123-4567",
      facilities: ["E-waste", "Plastic", "Paper", "Metal"],
      distance: "1.2 km",
      waitTime: "5-10 mins",
      image: "🏢"
    },
    {
      id: 2,
      name: "Northside Eco Center",
      address: "456 Green Street, North District",
      hours: "Mon-Sat: 9:00 AM - 6:00 PM",
      contact: "+1 (555) 123-4568",
      facilities: ["E-waste", "Batteries", "Glass"],
      distance: "3.5 km",
      waitTime: "10-15 mins",
      image: "🌿"
    },
    {
      id: 3,
      name: "Westend Recycling Point",
      address: "789 Sustainable Road, West Area",
      hours: "Tue-Sun: 7:00 AM - 9:00 PM",
      contact: "+1 (555) 123-4569",
      facilities: ["E-waste", "Plastic", "Organic"],
      distance: "5.1 km",
      waitTime: "15-20 mins",
      image: "♻️"
    },
    {
      id: 4,
      name: "Eco Valley Drop-off",
      address: "321 Conservation Lane, Valley View",
      hours: "Mon-Fri: 8:00 AM - 7:00 PM",
      contact: "+1 (555) 123-4570",
      facilities: ["E-waste", "Metal", "Textiles"],
      distance: "7.8 km",
      waitTime: "20-25 mins",
      image: "🏞️"
    }
  ];

  const acceptedItems = [
    { name: "Mobile Phones", icon: "📱" },
    { name: "Laptops", icon: "💻" },
    { name: "Batteries", icon: "🔋" },
    { name: "Cables", icon: "🔌" },
    { name: "Monitors", icon: "📺" },
    { name: "Printers", icon: "🖨️" },
    { name: "Tablets", icon: "📟" },
    { name: "Other E-waste", icon: "🔧" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🏢 Drop-off Centers
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find convenient locations to drop off your e-waste for proper recycling
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Centers List */}
          <div className="lg:col-span-2 space-y-6">
            {centers.map((center) => (
              <div
                key={center.id}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:scale-105 transition-transform duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl">{center.image}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{center.name}</h3>
                        <p className="text-gray-600">{center.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {center.distance} away
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{center.waitTime}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600"><strong>Hours:</strong> {center.hours}</p>
                      <p className="text-gray-600"><strong>Contact:</strong> {center.contact}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2"><strong>Accepts:</strong></p>
                      <div className="flex flex-wrap gap-2">
                        {center.facilities.map((facility, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-800 font-medium">
                      💡 No appointment needed - Walk in during operating hours
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🚀 Quick Drop-off</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center space-x-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>No appointment needed</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Professional assessment</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Instant processing</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Environmentally certified</span>
                </li>
              </ul>
            </div>

            {/* Accepted Items */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">📦 Accepted Items</h3>
              <div className="grid grid-cols-2 gap-3">
                {acceptedItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-green-400">
                <p className="text-sm text-green-100">
                  All items are processed according to environmental standards
                </p>
              </div>
            </div>

            {/* Preparation Tips */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-yellow-800 mb-4">💡 Preparation Tips</h3>
              <ul className="space-y-2 text-yellow-700 text-sm">
                <li>• Bring valid identification</li>
                <li>• Separate different item types</li>
                <li>• Remove personal data from devices</li>
                <li>• Check center hours before visiting</li>
                <li>• Ask for recycling certificate</li>
                <li>• Package fragile items securely</li>
              </ul>
            </div>

            {/* Environmental Impact */}
            <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-green-800 mb-4">🌍 Environmental Impact</h3>
              <ul className="space-y-2 text-green-700 text-sm">
                <li>• Prevents hazardous waste in landfills</li>
                <li>• Conserves natural resources</li>
                <li>• Reduces energy consumption</li>
                <li>• Supports circular economy</li>
                <li>• Protects water sources</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Need Home Collection Instead?
            </h3>
            <p className="text-gray-600 mb-6">
              Schedule a convenient home pickup service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/request"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
              >
                🏠 Schedule Home Pickup
              </Link>
              <Link
                to="/history"
                className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition-all"
              >
                📋 View History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropoffCenters;