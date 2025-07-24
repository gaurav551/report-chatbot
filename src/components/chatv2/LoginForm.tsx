import { Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const LoginForm: React.FC<{ onLogin: (userName: string) => void }> = ({ onLogin }) => {
  const [userName, setUserName] = useState('');
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    // Auto-submit with userId if present in params
    if (userId) {
      onLogin(`${userId}`);
    }
  }, [userId, onLogin]);

  const handleSubmit = () => {
    if (userName.trim()) {
      onLogin(userName.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to AI Reporting Agent v2</h1>
          <p className="text-gray-600">Enter your name to start chatting</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your name..."
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Chatting
          </button>
        </div>
      </div>
    </div>
  );
};