import { Send, Mic, MicOff } from "lucide-react";
import { useState, forwardRef, useEffect, useRef } from "react";
import { ServiceType } from "../../const/serviceType";

export const ChatInput = forwardRef<HTMLInputElement, {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  voicePrompt?: string;
  isVoiceEnabled?: boolean;
  serviceType? : ServiceType;
  chatEnabled?:boolean;
}>(({ onSendMessage, disabled, placeholder = "Type your message...", voicePrompt, isVoiceEnabled = false, serviceType=ServiceType.NLP, chatEnabled = false }, ref) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const internalRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Use the forwarded ref if provided, otherwise use internal ref
  const inputRef = ref || internalRef;

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition ||  (window as any).webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      // Enable continuous and interim results for better voice recognition
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      // Add additional settings for better voice quality
      recognitionRef.current.maxAlternatives = 1;
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        
        // Process all results to get the most accurate transcript
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            transcript += result[0].transcript;
            isFinal = true;
          } else {
            // Show interim results in real-time
            const interimTranscript = result[0].transcript;
            const tempMessage = voicePrompt ? `${voicePrompt} ${interimTranscript}` : interimTranscript;
            setMessage(tempMessage);
          }
        }
        
        // Only process final results
        if (isFinal && transcript.trim()) {
          // Clean up the transcript
          transcript = transcript.trim().replace(/\.+$/, '');
          const finalMessage = voicePrompt ? `${voicePrompt} ${transcript}` : transcript;
          
          // Set the message and auto-send
          setMessage(finalMessage);
          
          // Stop listening
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
          
          // Auto-send the message after a brief delay to ensure state updates
          setTimeout(() => {
            onSendMessage(finalMessage.trim());
            setMessage('');
            // Refocus the input
            if (inputRef && 'current' in inputRef) {
              inputRef.current?.focus();
            }
          }, 100);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Handle specific error cases
        if (event.error === 'no-speech') {
          console.log('No speech detected, stopping recognition');
        } else if (event.error === 'network') {
          console.log('Network error, please check your connection');
        }
      };
      
      // Handle when speech recognition stops automatically
      recognitionRef.current.onspeechend = () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [voicePrompt, onSendMessage]);

  const handleSubmit = () => {
   
      onSendMessage(message.trim());
      setMessage('');
      // Refocus the input after sending message
      if (inputRef && 'current' in inputRef) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleVoiceInput = () => {
    if (!speechSupported || disabled) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // Clear any existing message before starting voice input
      setMessage('');
      recognitionRef.current?.start();
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
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={serviceType==ServiceType.PRO? !chatEnabled : disabled}
          autoFocus
          className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100"
          placeholder={isListening ? "Listening..." : placeholder}
        />
        {speechSupported && isVoiceEnabled && (
          <button
            onClick={toggleVoiceInput}
            disabled={disabled}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all ${
              isListening 
                ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={disabled || (serviceType !== ServiceType.PRO && !message.trim())}
        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
});