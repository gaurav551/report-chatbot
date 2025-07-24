import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Film, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 mb-4">
            404
          </div>
          <div className="absolute inset-0 text-8xl font-bold text-purple-600/20 blur-sm">
            404
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default NotFound;