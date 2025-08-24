import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ChatSession } from "../../interfaces/Message";
import { LoginForm } from "./LoginForm";
import { ChatMain } from "./ChatMain";
import { ChatHeader } from "./ChatHeader";

interface ValidationResponse {
  username: string;
  user_id: string;
  valid: boolean;
  message: string;
}

const validateUser = async (username: string, userId: string): Promise<ValidationResponse> => {
  const response = await axios.get(`https://agentic.aiweaver.ai/user/${username}_${userId}`);
  return response.data;
};

const ChatV2: React.FC = () => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const { userName: urlUserName, userId: urlUserId } = useParams<{ userName: string; userId: string }>();

  const validationMutation = useMutation({
    mutationFn: ({ username, userId }: { username: string; userId: string }) =>
      validateUser(username, userId),
    onSuccess: (data, variables) => {
      if (data.valid) {
        const newSession: ChatSession = {
          userName: variables.username,
          userId: variables.userId,
          sessionId: Date.now().toString()
        };
        setSession(newSession);
        console.log('Login successful:', data);
      } else {
        console.error('Login failed:', data.message);
        // The error will be handled by the LoginForm component
      }
    },
    onError: (error) => {
      console.error('API validation failed:', error);
    }
  });

  useEffect(() => {
    // Check for existing session in memory
    // You can implement your own session persistence here
    const savedSession = null; // Replace with your session retrieval logic
    if (savedSession) {
      setSession(savedSession);
    }

    // Auto-login if both userName and userId are provided in URL
    if (urlUserName && urlUserId && !session && !validationMutation.isPending) {
      validationMutation.mutate({ username: urlUserName, userId: urlUserId });
    }
  }, [urlUserName, urlUserId]);

  const handleLogin = (userName: string, userId: string) => {
    validationMutation.mutate({ username: userName, userId });
  };

  const handleClearSession = () => {
    if (session) {
      // Create a new session with the same user credentials but new sessionId
      const newSession: ChatSession = {
        userName: session.userName,
        userId: session.userId,
        sessionId: Date.now().toString() // Generate new session ID
      };
      
      setSession(newSession);
      
      // Clear any chat history or temporary data without affecting the login state
      // You can clear specific localStorage items here if needed
      // For example: localStorage.removeItem('chatHistory');
      // localStorage.removeItem('tempData');
      
      console.log('New session created:', newSession);
    }
  };

  if (!session) {
    // If URL parameters are present, show loading or error instead of login form
    if (urlUserName && urlUserId) {
      if (validationMutation.isPending) {
        return <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Validating credentials...</p>
          </div>
        </div>;
      }
      
      if (validationMutation.error || (validationMutation.data && !validationMutation.data.valid)) {
        const errorMessage = validationMutation.error ? 'Network error' : 'Invalid credentials';
        return <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-xl mb-2">❌ Authentication Failed</p>
            <p>Please contact us at info@aiweaver.ai.</p>
          
          </div>
        </div>;
      }
    }

    return (
      <LoginForm
        onLogin={handleLogin}
        isLoading={validationMutation.isPending}
        error={validationMutation.error as Error | null}
        validationError={!validationMutation.data?.valid ? validationMutation.data?.message : undefined}
      />
    );
  }

  return <ChatHeader session={session} onClearSession={handleClearSession} />; // Updated component
};

export default ChatV2;