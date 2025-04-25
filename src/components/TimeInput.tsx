
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import VoiceInputService from '@/services/VoiceInput';
import { parseTimeQuery } from '@/services/ChatParser';

interface TimeInputProps {
  onQuerySubmit: (query: string) => void;
}

const TimeInput: React.FC<TimeInputProps> = ({ onQuerySubmit }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeholder, setPlaceholder] = useState('Enter your time zone question...');
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onQuerySubmit(query);
      setQuery('');
    } else {
      toast({
        title: "Empty Query",
        description: "Please enter a time zone question",
        variant: "destructive",
      });
    }
  };

  const stopVoiceInput = () => {
    VoiceInputService.stopListening();
    setIsListening(false);
    setPlaceholder('Enter your time zone question...');
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
        (transcript, isFinal) => {
          setQuery(transcript);
          
          if (isFinal) {
            setIsListening(false);
            setPlaceholder('Enter your time zone question...');
            
            // Auto-submit if query is valid
            const parsedQuery = parseTimeQuery(transcript);
            if (parsedQuery.isValid) {
              setTimeout(() => {
                onQuerySubmit(transcript);
                setQuery('');
              }, 500);
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
          setPlaceholder('Enter your time zone question...');
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
          />
        </div>
        
        <Button 
          type="button" 
          onClick={toggleVoiceInput}
          className={`neo-raised p-3 ${isListening ? 'bg-neo-my-accent text-white' : ''}`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </Button>
        
        <Button 
          type="submit" 
          className="neo-raised bg-neo-my-accent text-white hover:bg-neo-my-accent/80"
        >
          Convert
        </Button>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        Try: "What's 3pm EST in Tokyo?" or "Convert 9am London to PST"
      </div>
    </form>
  );
};

export default TimeInput;
