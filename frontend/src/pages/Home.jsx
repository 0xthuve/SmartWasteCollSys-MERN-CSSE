// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import homebg from "../assets/homebg.png";

const Home = () => {
  const features = [
    {
      icon: "🔄",
      title: "Easy Recycling",
      description: "Schedule pickups or drop-off with just a few clicks"
    },
    {
      icon: "🏆",
      title: "Earn Rewards",
      description: "Get reward points for every recycling contribution"
    },
    {
      icon: "📱",
      title: "Track Progress",
      description: "Monitor your recycling impact and rewards"
    },
    {
      icon: "🌱",
      title: "Eco-Friendly",
      description: "Contribute to a cleaner, greener environment"
    }
  ];

  const stats = [
    { number: "10K+", label: "Items Recycled" },
    { number: "500+", label: "Happy Users" },
    { number: "2.5K", label: "Reward Points Given" },
    { number: "95%", label: "Satisfaction Rate" }
  ];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${homebg})` }}
    >
      {/* Overlay */}
      <div className="min-h-screen bg-black bg-opacity-50 flex items-center">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Smart Waste Management
              <span className="block text-green-400 text-4xl md:text-5xl">
                For a Greener Tomorrow
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed">
              Transform your e-waste into rewards while contributing to environmental sustainability. 
              Our smart system makes recycling effortless and rewarding.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/request"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 font-bold text-lg hover:scale-105"
              >
                ♻️ Request Recycling Collection
              </Link>
              <button className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-4 rounded-xl transition-all duration-300 font-bold text-lg">
                Learn More
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white bg-opacity-90 rounded-2xl p-6 text-center shadow-lg backdrop-blur-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">{stat.number}</div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="bg-white bg-opacity-95 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Why Choose EcoRecycle?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-6 hover:scale-105 transition-transform duration-300">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Make a Difference?
              </h3>
              <p className="text-green-100 mb-6 text-lg">
                Join thousands of eco-conscious users today
              </p>
              <Link
                to="/request"
                className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 inline-block"
              >
                Start Recycling Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;