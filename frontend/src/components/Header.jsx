// src/components/Header.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/request", label: "Request Collection" },
    { path: "/schedule", label: "Schedule Pickup" },
    { path: "/dropoff", label: "Drop-off Centers" },
    { path: "/history", label: "History" },
  ];

  return (
    <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform">
          <img src={logo} alt="EcoRecycle Logo" className="h-10 w-10 rounded-full" />
          <div>
            <h1 className="text-xl font-bold tracking-wide">EcoRecycle</h1>
            <p className="text-xs text-green-200">Smart Waste Management</p>
          </div>
        </Link>
        
        <nav className="flex space-x-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                location.pathname === item.path
                  ? "bg-white text-green-700 shadow-md font-bold"
                  : "hover:bg-green-500 hover:text-white hover:shadow-md"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;