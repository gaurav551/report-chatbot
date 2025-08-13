import { useEffect, useState } from "react";
import { ChatSession } from "../../interfaces/Message";
import { LoginForm } from "./LoginForm";
import { ChatMain } from "./ChatMain";
import { ChatHeader } from "./ChatHeader";



const ChatV2: React.FC = () => {
  const [session, setSession] = useState<ChatSession | null>(null);

  useEffect(() => {
    // Check for existing session in memory
    // You can implement your own session persistence here
    const savedSession = null; // Replace with your session retrieval logic
    if (savedSession) {
      setSession(savedSession);
    }
  }, []);

  const handleLogin = (userName: string) => {
    const newSession: ChatSession = {
      userName,
      sessionId: Date.now().toString()
    };
    setSession(newSession);
    // Save to your preferred storage method
  };

  const handleClearSession = () => {
    setSession(null);
    localStorage.clear(); // Clear session from localStorage
    // Clear from your preferred storage method
  };

  if (!session) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <ChatHeader session={session} onClearSession={handleClearSession} />; // Updated component
};

export default ChatV2;