
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import OpenAIService, { AVAILABLE_MODELS as OPENAI_MODELS } from '@/services/OpenAIService';
import LlamaService, { AVAILABLE_MODELS as LLAMA_MODELS } from '@/services/LlamaService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SettingsButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'openai' | 'llama'>(
    LlamaService.hasApiKey() ? 'llama' : 'openai'
  );

  // OpenAI settings
  const [openaiApiKey, setOpenaiApiKey] = useState(OpenAIService.getApiKey() || '');
  const [selectedOpenaiModel, setSelectedOpenaiModel] = useState(OpenAIService.getSelectedModel());
  
  // Llama settings
  const [llamaApiKey, setLlamaApiKey] = useState(LlamaService.getApiKey() || '');
  const [selectedLlamaModel, setSelectedLlamaModel] = useState(LlamaService.getSelectedModel());

  const handleSaveSettings = () => {
    try {
      // Save OpenAI API key and model
      if (openaiApiKey.trim()) {
        OpenAIService.setApiKey(openaiApiKey.trim());
        OpenAIService.setSelectedModel(selectedOpenaiModel);
      } else {
        // If field is empty, clear the API key
        OpenAIService.setApiKey('');
      }
      
      // Save Llama API key and model
      if (llamaApiKey.trim()) {
        LlamaService.setApiKey(llamaApiKey.trim());
        LlamaService.setSelectedModel(selectedLlamaModel);
      } else {
        // If field is empty, clear the API key
        LlamaService.setApiKey('');
      }
      
      toast({
        title: "Settings Saved",
        description: "API settings have been updated",
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

  const testAPI = async () => {
    try {
      if (activeTab === 'openai') {
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
      } else if (activeTab === 'llama') {
        if (!llamaApiKey.trim()) {
          toast({
            title: "Missing API Key",
            description: "Please enter your Perplexity API key first",
            variant: "destructive",
          });
          return;
        }

        // Set the API key temporarily
        LlamaService.setApiKey(llamaApiKey.trim());
        LlamaService.setSelectedModel(selectedLlamaModel);

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
            description: "Connection to Perplexity API is working",
          });
        }
      }
    } catch (error) {
      console.error('API test error:', error);
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
              Configure AI services for time zone processing
            </DialogDescription>
          </DialogHeader>
          
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'openai' | 'llama')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="llama">Perplexity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="openai" className="space-y-4">
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
                  Used for time zone and location processing
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
                onClick={testAPI}
                className="w-full"
              >
                Test OpenAI API
              </Button>
            </TabsContent>
            
            <TabsContent value="llama" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="llamaApiKey">Perplexity API Key</Label>
                <Input
                  id="llamaApiKey"
                  value={llamaApiKey}
                  onChange={(e) => setLlamaApiKey(e.target.value)}
                  placeholder="Enter your Perplexity API key"
                  className="neo-inset bg-neo-inset text-white"
                  type="password"
                />
                <p className="text-xs text-gray-400">
                  Perplexity AI offers accurate time and location recognition
                </p>
              </div>

              <div className="space-y-2">
                <Label>Select Perplexity Model</Label>
                <Select value={selectedLlamaModel} onValueChange={setSelectedLlamaModel}>
                  <SelectTrigger className="neo-inset bg-neo-inset text-white">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent className="bg-neo-background border border-gray-700">
                    {LLAMA_MODELS.map((model) => (
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
                onClick={testAPI}
                className="w-full"
              >
                Test Perplexity API
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
