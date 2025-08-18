import { Send } from "lucide-react";
import { useState, forwardRef, useEffect, useRef } from "react";

export const ChatInput = forwardRef<HTMLInputElement, {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}>(({ onSendMessage, disabled, placeholder = "Type your message..." }, ref) => {
  const [message, setMessage] = useState('');
  const internalRef = useRef<HTMLInputElement>(null);
  
  // Use the forwarded ref if provided, otherwise use internal ref
  const inputRef = ref || internalRef;

  const handleSubmit = () => {
    if (!disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Refocus the input after sending message
      if (inputRef && 'current' in inputRef) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-focus on mount and when disabled state changes
  useEffect(() => {
    if (!disabled && inputRef && 'current' in inputRef) {
      inputRef.current?.focus();
    }
  }, [disabled, inputRef]);

  return (
    <div className="flex space-x-2">
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        autoFocus
        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100"
        placeholder={placeholder}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled}
        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
});