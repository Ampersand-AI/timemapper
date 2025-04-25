
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
import DeepSeekService from '@/services/DeepSeekService';

const SettingsButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [deepseekApiKey, setDeepseekApiKey] = useState(DeepSeekService.getApiKey() || '');

  const handleSaveSettings = () => {
    try {
      // Save DeepSeek API key
      if (deepseekApiKey.trim()) {
        DeepSeekService.setApiKey(deepseekApiKey.trim());
        toast({
          title: "Settings Saved",
          description: "DeepSeek API key has been updated",
        });
      } else {
        // If field is empty, clear the API key
        DeepSeekService.setApiKey('');
        toast({
          title: "Settings Updated",
          description: "DeepSeek API integration has been disabled",
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

  const testDeepSeekAPI = async () => {
    try {
      if (!deepseekApiKey.trim()) {
        toast({
          title: "Missing API Key",
          description: "Please enter your DeepSeek API key first",
          variant: "destructive",
        });
        return;
      }

      // Set the API key temporarily
      DeepSeekService.setApiKey(deepseekApiKey.trim());

      // Test with a simple query
      const result = await DeepSeekService.verifyTimeQuery("Test query for DeepSeek API");

      if (result.error) {
        toast({
          title: "API Test Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "API Test Successful",
          description: "Connection to DeepSeek API is working",
        });
      }
    } catch (error) {
      console.error('DeepSeek API test error:', error);
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
              <Label htmlFor="deepseekApiKey">DeepSeek API Key</Label>
              <Input
                id="deepseekApiKey"
                value={deepseekApiKey}
                onChange={(e) => setDeepseekApiKey(e.target.value)}
                placeholder="Enter your DeepSeek API key"
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
              onClick={testDeepSeekAPI}
              className="w-full"
            >
              Test DeepSeek API
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
