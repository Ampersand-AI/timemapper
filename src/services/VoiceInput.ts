
// Voice input using Web Speech API

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error?: SpeechRecognitionError;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

// Global augmentation for Window interface
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// Type for voice recognition result handlers
type RecognitionResultHandler = (transcript: string, isFinal: boolean) => void;
type RecognitionErrorHandler = (error: string) => void;

class VoiceInputService {
  private recognition: SpeechRecognition | null = null;
  private isSupported = false;
  private isListening = false;

  constructor() {
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    if (this.isSupported) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        this.recognition = new SpeechRecognitionClass();
        this.setupRecognition();
      }
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return;
    
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
  }

  public isVoiceSupported(): boolean {
    return this.isSupported;
  }

  public startListening(
    onResult: RecognitionResultHandler, 
    onError: RecognitionErrorHandler
  ): void {
    if (!this.recognition || this.isListening) return;
    
    this.isListening = true;
    
    // Set up event handlers
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;
      
      onResult(transcript, isFinal);
    };
    
    this.recognition.onerror = (event: SpeechRecognitionError) => {
      onError(event.error);
      this.isListening = false;
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
    };
    
    // Start listening
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      onError('Failed to start voice recognition');
      this.isListening = false;
    }
  }

  public stopListening(): void {
    if (!this.recognition || !this.isListening) return;
    
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
    
    this.isListening = false;
  }

  public isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

export default new VoiceInputService();
