
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
import LlamaService, { AVAILABLE_MODELS } from '@/services/LlamaService';

const SettingsButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState(LlamaService.getApiKey() || '');
  const [selectedModel, setSelectedModel] = useState(LlamaService.getSelectedModel());

  const handleSaveSettings = () => {
    try {
      // Save Llama API key
      if (apiKey.trim()) {
        LlamaService.setApiKey(apiKey.trim());
        LlamaService.setSelectedModel(selectedModel);
        toast({
          title: "Settings Saved",
          description: "Llama API key and model have been updated",
        });
      } else {
        // If field is empty, clear the API key
        LlamaService.setApiKey('');
        toast({
          title: "Settings Updated",
          description: "Llama API integration has been disabled",
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

  const testLlamaAPI = async () => {
    try {
      if (!apiKey.trim()) {
        toast({
          title: "Missing API Key",
          description: "Please enter your Llama API key first",
          variant: "destructive",
        });
        return;
      }

      // Set the API key temporarily
      LlamaService.setApiKey(apiKey.trim());
      LlamaService.setSelectedModel(selectedModel);

      // Test with a simple query
      const result = await LlamaService.verifyTimeQuery("What time is it in London?");

      if (result.error) {
        toast({
          title: "API Test Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "API Test Successful",
          description: "Connection to Llama API is working",
        });
      }
    } catch (error) {
      console.error('Llama API test error:', error);
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
              <Label htmlFor="apiKey">Llama API Key</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Perplexity AI key for Llama"
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
              onClick={testLlamaAPI}
              className="w-full"
            >
              Test Llama API
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
