
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import GeminiService from '@/services/GeminiService';

const SettingsButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(GeminiService.getApiKey() || '');

  const handleSaveSettings = () => {
    try {
      // Save Gemini API key
      if (geminiApiKey.trim()) {
        GeminiService.setApiKey(geminiApiKey.trim());
        toast({
          title: "Settings Saved",
          description: "Gemini API key has been updated",
        });
      } else {
        // If field is empty, clear the API key
        GeminiService.setApiKey('');
        toast({
          title: "Settings Updated",
          description: "Gemini API integration has been disabled",
          variant: "destructive",
        });
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Settings Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  const testGeminiAPI = async () => {
    try {
      if (!geminiApiKey.trim()) {
        toast({
          title: "Missing API Key",
          description: "Please enter your Gemini API key first",
          variant: "destructive",
        });
        return;
      }

      // Set the API key temporarily
      GeminiService.setApiKey(geminiApiKey.trim());

      // Test with a simple query
      const result = await GeminiService.verifyTimeQuery("Test query for Gemini API");

      if (result.error) {
        toast({
          title: "API Test Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "API Test Successful",
          description: "Connection to Gemini API is working",
        });
      }
    } catch (error) {
      console.error('Gemini API test error:', error);
      toast({
        title: "API Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant="ghost" 
        size="icon" 
        className="absolute top-6 right-6"
      >
        <Settings size={24} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="neo-raised bg-neo-background text-white">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure app settings and integrations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="geminiApiKey">Gemini API Key</Label>
              <Input
                id="geminiApiKey"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="neo-inset bg-neo-inset text-white"
                type="password"
              />
              <p className="text-xs text-gray-400">
                Used for AI-enhanced query validation and processing
              </p>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={testGeminiAPI}
              className="w-full"
            >
              Test Gemini API
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} className="bg-neo-my-accent text-white hover:bg-neo-my-accent/80">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsButton;
