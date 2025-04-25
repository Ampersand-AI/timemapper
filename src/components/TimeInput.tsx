
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import VoiceInputService from '@/services/VoiceInput';
import { parseTimeQuery } from '@/services/ChatParser';
import LlamaService from '@/services/LlamaService';
import GeminiService from '@/services/GeminiService';

interface TimeInputProps {
  onQuerySubmit: (query: string) => void;
}

const TimeInput: React.FC<TimeInputProps> = ({ onQuerySubmit }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholder, setPlaceholder] = useState('Enter any city, state, country or timezone...');
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto-stop voice recording after 5 seconds of silence
  useEffect(() => {
    let silenceTimer: NodeJS.Timeout | null = null;
    
    if (isListening) {
      silenceTimer = setTimeout(() => {
        stopVoiceInput();
      }, 5000); // Stop after 5 seconds of silence
    }
    
    return () => {
      if (silenceTimer) clearTimeout(silenceTimer);
    };
  }, [isListening]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a location or time zone question",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      // First try with basic validation as it's faster
      const parsedQuery = parseTimeQuery(query);
      
      if (parsedQuery.isValid) {
        // If basic validation passes, just submit the query
        onQuerySubmit(query);
        setQuery('');
        setIsValidating(false);
        return;
      }
      
      // Try with AI if basic validation fails
      if (GeminiService.hasApiKey()) {
        const result = await GeminiService.verifyTimeQuery(query);
        
        if (result.isValid) {
          // Pass the query to parent component
          onQuerySubmit(query);
          setQuery('');
          setIsValidating(false);
          return;
        }
        
        // Let's try once more by reformulating as a time query
        const enhancedQuery = `What time is it in ${query}?`;
        const enhancedResult = await GeminiService.verifyTimeQuery(enhancedQuery);
        
        if (enhancedResult.isValid) {
          // Pass the enhanced query to parent component
          onQuerySubmit(enhancedQuery);
          setQuery('');
          setIsValidating(false);
          return;
        }
      }
      
      // Try with Llama if Gemini fails
      if (LlamaService.hasApiKey()) {
        const result = await LlamaService.verifyTimeQuery(query);
        
        if (result.isValid) {
          onQuerySubmit(query);
          setQuery('');
          setIsValidating(false);
          return;
        }
        
        const enhancedQuery = `What time is it in ${query}?`;
        const enhancedResult = await LlamaService.verifyTimeQuery(enhancedQuery);
        
        if (enhancedResult.isValid) {
          onQuerySubmit(enhancedQuery);
          setQuery('');
          setIsValidating(false);
          return;
        }
      }
      
      // All validation attempts failed
      toast({
        title: "Invalid Query",
        description: "Please specify a location or timezone. For example: 'New York', 'Tokyo', or '3pm EST in Berlin'",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error validating query:', error);
      // Try one last attempt with basic validation
      const parsedQuery = parseTimeQuery(query);
      if (parsedQuery.isValid) {
        onQuerySubmit(query);
        setQuery('');
      } else {
        toast({
          title: "Invalid Query",
          description: "Please try a different query format",
          variant: "destructive",
        });
      }
    } finally {
      setIsValidating(false);
    }
  };

  const stopVoiceInput = () => {
    VoiceInputService.stopListening();
    setIsListening(false);
    setPlaceholder('Enter any city, state, country or timezone...');
  };

  const toggleVoiceInput = () => {
    if (!VoiceInputService.isVoiceSupported()) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive",
      });
      return;
    }
    
    if (isListening) {
      stopVoiceInput();
    } else {
      setPlaceholder('Listening...');
      setIsListening(true);
      
      VoiceInputService.startListening(
        async (transcript, isFinal) => {
          setQuery(transcript);
          
          if (isFinal) {
            // Auto-stop voice recording
            stopVoiceInput();
            
            // Immediately process valid queries for better responsiveness
            const parsedQuery = parseTimeQuery(transcript);
            if (parsedQuery.isValid) {
              setTimeout(() => {
                onQuerySubmit(transcript);
                setQuery('');
              }, 300); // Reduced timeout for faster response
              return;
            }
            
            // Only use AI validation if basic validation fails
            if (GeminiService.hasApiKey() || LlamaService.hasApiKey()) {
              try {
                setIsValidating(true);
                
                // Try with Gemini first if available
                if (GeminiService.hasApiKey()) {
                  const result = await GeminiService.verifyTimeQuery(transcript);
                  
                  if (result.isValid) {
                    // Auto-submit if query is valid
                    onQuerySubmit(transcript);
                    setQuery('');
                    setIsValidating(false);
                    return;
                  }
                }
                
                // Try with Llama if Gemini fails or isn't available
                if (LlamaService.hasApiKey()) {
                  const result = await LlamaService.verifyTimeQuery(transcript);
                  
                  if (result.isValid) {
                    // Auto-submit if query is valid
                    onQuerySubmit(transcript);
                    setQuery('');
                    setIsValidating(false);
                    return;
                  }
                }
                
                toast({
                  title: "Invalid Query",
                  description: "Please try again with a clearer query",
                  variant: "destructive",
                });
                
              } catch (error) {
                console.error('Error validating voice query:', error);
                // Still try with basic validation as fallback
                if (parsedQuery.isValid) {
                  onQuerySubmit(transcript);
                  setQuery('');
                }
              } finally {
                setIsValidating(false);
              }
            }
          }
        },
        (error) => {
          toast({
            title: "Voice Recognition Error",
            description: error,
            variant: "destructive",
          });
          setIsListening(false);
          setPlaceholder('Enter any city, state, country or timezone...');
        }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="neo-inset px-4 py-3 h-12 bg-neo-inset text-white"
            disabled={isValidating}
          />
        </div>
        
        <Button 
          type="button" 
          onClick={toggleVoiceInput}
          className={`neo-raised p-3 ${isListening ? 'bg-neo-my-accent text-white' : ''}`}
          disabled={isValidating}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </Button>
        
        <Button 
          type="submit" 
          className="neo-raised bg-neo-my-accent text-white hover:bg-neo-my-accent/80"
          disabled={isValidating}
        >
          {isValidating ? 'Analyzing...' : 'Convert'}
        </Button>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        Try: "New York", "Paris time", "What's the time in Tokyo?", "3pm EST in Berlin"
      </div>
    </form>
  );
};

export default TimeInput;
