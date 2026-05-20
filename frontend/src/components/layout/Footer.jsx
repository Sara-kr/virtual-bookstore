import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <div className="text-white font-bold text-lg flex items-center gap-2 mb-3">
              <span>📚</span> BookStore
            </div>
            <p className="text-sm leading-relaxed">
              Your one-stop destination for books across every genre.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-3">Browse</p>
            <div className="space-y-2 text-sm">
              <Link to="/search" className="block hover:text-white transition-colors">All Books</Link>
              <Link to="/search?category=Programming" className="block hover:text-white transition-colors">Programming</Link>
              <Link to="/search?category=Fiction" className="block hover:text-white transition-colors">Fiction</Link>
              <Link to="/search?category=Self-Help" className="block hover:text-white transition-colors">Self-Help</Link>
            </div>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-3">Account</p>
            <div className="space-y-2 text-sm">
              <Link to="/dashboard" className="block hover:text-white transition-colors">Dashboard</Link>
              <Link to="/orders" className="block hover:text-white transition-colors">My Orders</Link>
              <Link to="/cart" className="block hover:text-white transition-colors">Cart</Link>
              <Link to="/notifications" className="block hover:text-white transition-colors">Notifications</Link>
            </div>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-3">Info</p>
            <div className="space-y-2 text-sm">
              <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noreferrer"
                className="block hover:text-white transition-colors">API Docs (Swagger)</a>
              <a href="http://localhost:8080/actuator/health" target="_blank" rel="noreferrer"
                className="block hover:text-white transition-colors">Server Health</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} BookStore Platform. All rights reserved.</p>
          <p>Built with Spring Boot + React + Redis + WebSocket</p>
        </div>
      </div>
    </footer>
  );
}
