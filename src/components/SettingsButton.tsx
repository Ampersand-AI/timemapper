
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import GeminiService, { AVAILABLE_MODELS } from '@/services/GeminiService';

const SettingsButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState(GeminiService.getApiKey() || '');
  const [selectedModel, setSelectedModel] = useState(GeminiService.getSelectedModel());

  const handleSaveSettings = () => {
    try {
      // Save Gemini API key
      if (apiKey.trim()) {
        GeminiService.setApiKey(apiKey.trim());
        GeminiService.setSelectedModel(selectedModel);
        toast({
          title: "Settings Saved",
          description: "Gemini API key and model have been updated",
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
      if (!apiKey.trim()) {
        toast({
          title: "Missing API Key",
          description: "Please enter your Gemini API key first",
          variant: "destructive",
        });
        return;
      }

      // Set the API key temporarily
      GeminiService.setApiKey(apiKey.trim());
      GeminiService.setSelectedModel(selectedModel);

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
              <Label htmlFor="apiKey">Gemini API Key</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="neo-inset bg-neo-inset text-white"
                type="password"
              />
              <p className="text-xs text-gray-400">
                Used for AI-enhanced query validation and processing
              </p>
            </div>

            <div className="space-y-2">
              <Label>Select Model</Label>
              <RadioGroup 
                value={selectedModel} 
                onValueChange={setSelectedModel}
                className="space-y-2"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <div key={model.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={model.id} id={model.id} />
                    <Label htmlFor={model.id} className="text-sm">
                      {model.name} - {model.description}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
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
