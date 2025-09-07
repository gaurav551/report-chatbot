import { Bot, Loader2, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

interface FormData {
  userName: string;
  userId: string;
}

interface LoginFormProps {
  onLogin: (userName: string, userId: string) => void;
  isLoading?: boolean;
  error?: Error | null;
  validationError?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onLogin, 
  isLoading = false, 
  error, 
  validationError 
}) => {
  const { userName, } = useParams<{ userName: string }>();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    trigger,
    setError,
    clearErrors
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      userName: '',
      userId: ''
    }
  });

  // Clear localStorage when component mounts
  useEffect(() => {
    // Clear all authentication-related data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('session_id');
    
    // Optional: Clear other app-specific data if needed
    // localStorage.removeItem('authToken');
    // localStorage.removeItem('refreshToken');
    
    // Or clear all localStorage (use with caution)
    // localStorage.clear();
  }, []);

  useEffect(() => {
    // Auto-submit with userId if present in params
    if (userName) {
      setValue('userId', '');
      setValue('userName', userName);
      trigger(); // Trigger validation
      
    }
  }, [userName, onLogin, setValue, trigger]);

  // Handle validation errors from API
  useEffect(() => {
    if (validationError) {
      setError('root', { 
        type: 'manual', 
        message: validationError 
      });
    } else {
      clearErrors('root');
    }
  }, [validationError, setError, clearErrors]);

  // Handle network/API errors
  useEffect(() => {
    if (error) {
      setError('root', { 
        type: 'manual', 
        message: 'Network error. Please check your connection and try again.' 
      });
    }
  }, [error, setError]);

  const onSubmit = (data: FormData) => {
    clearErrors('root');
    onLogin(data.userName.trim(), data.userId.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to AI Reporting Agent v2</h1>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Global error message */}
          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              {...register('userName', {
                required: 'Name is required',
                minLength: {
                  value: 1,
                  message: 'Name must be at least 1 character'
                },
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: 'Name must contain only letters and spaces'
                }
              })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                errors.userName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your name..."
              disabled={isLoading}
            />
            {errors.userName && (
              <p className="mt-1 text-sm text-red-600">{errors.userName.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID *
            </label>
            <input
              type="text"
              {...register('userId', {
                required: 'User ID is required',
                minLength: {
                  value: 5,
                  message: 'User ID must be at least 5 characters long'
                },
                pattern: {
                  value: /^[a-zA-Z0-9_-]+$/,
                  message: 'User ID must contain only letters, numbers, underscores, and hyphens'
                }
              })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                errors.userId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your user ID (min. 5 characters)..."
              disabled={isLoading}
            />
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              isValid && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Validating...</span>
              </>
            ) : (
              <span>Start Chatting</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};