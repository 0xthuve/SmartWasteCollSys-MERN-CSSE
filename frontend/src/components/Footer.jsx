// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-black text-white">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-green-400">EcoRecycle</h3>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Transforming e-waste into opportunities while protecting our planet for future generations.
            </p>
            <div className="flex space-x-4">
              <div className="bg-green-600 p-2 rounded-lg hover:bg-green-700 transition cursor-pointer">
                📘
              </div>
              <div className="bg-green-600 p-2 rounded-lg hover:bg-green-700 transition cursor-pointer">
                📷
              </div>
              <div className="bg-green-600 p-2 rounded-lg hover:bg-green-700 transition cursor-pointer">
                🐦
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-green-300">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
              <li><Link to="/request" className="text-gray-400 hover:text-white transition">Request Collection</Link></li>
              <li><Link to="/schedule" className="text-gray-400 hover:text-white transition">Schedule Pickup</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-green-300">Contact Us</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <span>📞</span>
                <span>+1 (555) 123-ECO</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>📧</span>
                <span>support@ecorecycle.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>🏢</span>
                <span>123 Green Street, Eco City</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-green-300">Stay Updated</h4>
            <p className="text-gray-400 mb-3">Subscribe to our eco-newsletter</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 px-3 py-2 rounded-l-lg text-gray-800 focus:outline-none"
              />
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-r-lg transition">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} EcoRecycle - Smart Waste Management System. All rights reserved.</p>
          <p className="text-sm mt-2">♻️ Making the world greener, one recycle at a time</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;