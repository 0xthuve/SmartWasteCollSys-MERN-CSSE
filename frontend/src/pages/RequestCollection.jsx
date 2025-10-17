// src/pages/RequestCollection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import RequestCollectionBG from "../assets/RequestCollection.png";

const RequestCollection = () => {
  const navigate = useNavigate();

  const handleSelect = (method) => {
    if (method === "pickup") {
      navigate("/schedule", { state: { method: "Home Pickup" } });
    } else {
      navigate("/confirmation", { 
        state: { 
          method: "Drop-off at Center",
          refNumber: "REF" + Math.floor(100000 + Math.random() * 900000),
          estimatedPoints: 100
        } 
      });
    }
  };

  const collectionMethods = [
    {
      type: "pickup",
      icon: "🏠",
      title: "Home Pickup",
      description: "Schedule a convenient pickup from your location",
      features: [
        "Free doorstep collection",
        "Flexible time slots",
        "Professional handling",
        "Instant reward points"
      ],
      color: "from-green-500 to-emerald-600",
      buttonColor: "bg-green-600 hover:bg-green-700"
    },
    {
      type: "dropoff",
      icon: "🏢",
      title: "Drop-off at Center",
      description: "Visit our nearest recycling center",
      features: [
        "Instant processing",
        "Multiple locations",
        "Extended hours",
        "Bonus points available"
      ],
      color: "from-blue-500 to-cyan-600",
      buttonColor: "bg-blue-600 hover:bg-blue-700"
    }
  ];

  return (
    <div 
      className="min-h-screen bg-cover bg-center py-12"
      style={{ backgroundImage: `url(${RequestCollectionBG})` }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Collection Method
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Select how you'd like to recycle your e-waste. Both options earn you reward points!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {collectionMethods.map((method, index) => (
            <div 
              key={method.type}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:scale-105 transition-transform duration-300"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${method.color} p-6 text-white`}>
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{method.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold">{method.title}</h3>
                    <p className="text-white text-opacity-90">{method.description}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {method.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3 text-gray-700">
                      <span className="text-green-500 text-lg">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(method.type)}
                  className={`w-full ${method.buttonColor} text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl`}
                >
                  Select {method.title}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-white bg-opacity-90 rounded-2xl p-8 max-w-4xl mx-auto backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            📊 Recycling Impact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Points per Item</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Service Available</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600">Eco-Friendly</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestCollection;