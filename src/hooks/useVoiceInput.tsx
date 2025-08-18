import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceInputOptions {
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  error: string | null;
}

export const useVoiceInput = ({
  onResult,
  onError,
  language = 'en-US',
  continuous = false,
  interimResults = false,
}: UseVoiceInputOptions = {}): UseVoiceInputReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition ||  (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    recognitionRef.current = new SpeechRecognition();
    
    // Configure recognition
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = interimResults;
    recognitionRef.current.lang = language;

    // Event handlers
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult?.(transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      const errorMessage = event.error || 'Unknown speech recognition error';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsListening(false);
    };

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onResult, onError, language, continuous, interimResults]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current || isListening) return;
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      setError('Failed to start speech recognition');
      onError?.('Failed to start speech recognition');
    }
  }, [isSupported, isListening, onError]);

  const stopListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current || !isListening) return;
    
    recognitionRef.current.stop();
  }, [isSupported, isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    error,
  };
};