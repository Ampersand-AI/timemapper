
import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import GeminiService, { AVAILABLE_MODELS as GEMINI_MODELS } from '@/services/GeminiService';
import OpenAIService, { AVAILABLE_MODELS as OPENAI_MODELS } from '@/services/OpenAIService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SettingsButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'gemini' | 'openai'>('gemini');

  // Gemini settings
  const [geminiApiKey, setGeminiApiKey] = useState(GeminiService.getApiKey() || '');
  const [selectedGeminiModel, setSelectedGeminiModel] = useState(GeminiService.getSelectedModel());

  // OpenAI settings
  const [openaiApiKey, setOpenaiApiKey] = useState(OpenAIService.getApiKey() || '');
  const [selectedOpenaiModel, setSelectedOpenaiModel] = useState(OpenAIService.getSelectedModel());

  const handleSaveSettings = () => {
    try {
      // Save Gemini API key and model
      if (geminiApiKey.trim()) {
        GeminiService.setApiKey(geminiApiKey.trim());
        GeminiService.setSelectedModel(selectedGeminiModel);
      } else {
        // If field is empty, clear the API key
        GeminiService.setApiKey('');
      }
      
      // Save OpenAI API key and model
      if (openaiApiKey.trim()) {
        OpenAIService.setApiKey(openaiApiKey.trim());
        OpenAIService.setSelectedModel(selectedOpenaiModel);
      } else {
        // If field is empty, clear the API key
        OpenAIService.setApiKey('');
      }
      
      toast({
        title: "Settings Saved",
        description: "AI API keys and models have been updated",
      });
      
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

  const testAPI = async (provider: 'gemini' | 'openai') => {
    try {
      if (provider === 'gemini') {
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
        GeminiService.setSelectedModel(selectedGeminiModel);

        // Test with a simple query
        const result = await GeminiService.verifyTimeQuery("What time is it in London?");

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
      } else {
        if (!openaiApiKey.trim()) {
          toast({
            title: "Missing API Key",
            description: "Please enter your OpenAI API key first",
            variant: "destructive",
          });
          return;
        }

        // Set the API key temporarily
        OpenAIService.setApiKey(openaiApiKey.trim());
        OpenAIService.setSelectedModel(selectedOpenaiModel);

        // Test with a simple query
        const result = await OpenAIService.verifyTimeQuery("What time is it in London?");

        if (result.error) {
          toast({
            title: "API Test Failed",
            description: result.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "API Test Successful",
            description: "Connection to OpenAI API is working",
          });
        }
      }
    } catch (error) {
      console.error(`${provider} API test error:`, error);
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
              Configure app settings and AI integrations
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'gemini' | 'openai')}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="gemini">Gemini API</TabsTrigger>
              <TabsTrigger value="openai">OpenAI API</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gemini" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="geminiApiKey">Gemini API Key</Label>
                <Input
                  id="geminiApiKey"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Enter your Google API key for Gemini"
                  className="neo-inset bg-neo-inset text-white"
                  type="password"
                />
                <p className="text-xs text-gray-400">
                  Used for AI-enhanced query validation and location recognition
                </p>
              </div>

              <div className="space-y-2">
                <Label>Select Gemini Model</Label>
                <Select value={selectedGeminiModel} onValueChange={setSelectedGeminiModel}>
                  <SelectTrigger className="neo-inset bg-neo-inset text-white">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent className="bg-neo-background border border-gray-700">
                    {GEMINI_MODELS.map((model) => (
                      <SelectItem 
                        key={model.id} 
                        value={model.id}
                        className="text-white hover:bg-gray-700"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-gray-400">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => testAPI('gemini')}
                className="w-full"
              >
                Test Gemini API
              </Button>
            </TabsContent>
            
            <TabsContent value="openai" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                <Input
                  id="openaiApiKey"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="neo-inset bg-neo-inset text-white"
                  type="password"
                />
                <p className="text-xs text-gray-400">
                  Alternative to Gemini for enhanced query processing
                </p>
              </div>

              <div className="space-y-2">
                <Label>Select OpenAI Model</Label>
                <Select value={selectedOpenaiModel} onValueChange={setSelectedOpenaiModel}>
                  <SelectTrigger className="neo-inset bg-neo-inset text-white">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent className="bg-neo-background border border-gray-700">
                    {OPENAI_MODELS.map((model) => (
                      <SelectItem 
                        key={model.id} 
                        value={model.id}
                        className="text-white hover:bg-gray-700"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{model.name}</span>
                          <span className="text-xs text-gray-400">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => testAPI('openai')}
                className="w-full"
              >
                Test OpenAI API
              </Button>
            </TabsContent>
          </Tabs>

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
