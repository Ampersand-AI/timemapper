
import React from 'react';
import { Clock, Moon, Sun, Check } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ open, onOpenChange }) => {
  const { settings, updateSetting, resetSettings } = useSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-neo-background border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-gradient-teal">Settings</DialogTitle>
          <DialogDescription className="text-gray-400">
            Customize TimeMapper to your preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="mt-4">
          <TabsList className="grid grid-cols-2 bg-neo-inset text-gray-400">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="voice">Voice Input</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Theme</h3>
              <div className="flex space-x-2">
                <Button
                  variant={settings.theme === 'dark' ? 'default' : 'outline'}
                  className={`flex-1 ${settings.theme === 'dark' ? 'bg-neo-my-accent' : ''}`}
                  onClick={() => updateSetting('theme', 'dark')}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Dark
                  {settings.theme === 'dark' && <Check className="h-4 w-4 ml-2" />}
                </Button>
                <Button
                  variant={settings.theme === 'light' ? 'default' : 'outline'}
                  className={`flex-1 ${settings.theme === 'light' ? 'bg-neo-my-accent' : ''}`}
                  onClick={() => updateSetting('theme', 'light')}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Light
                  {settings.theme === 'light' && <Check className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Time Format</h3>
              <div className="flex space-x-2">
                <Button
                  variant={settings.timeFormat === '12h' ? 'default' : 'outline'}
                  className={`flex-1 ${settings.timeFormat === '12h' ? 'bg-neo-my-accent' : ''}`}
                  onClick={() => updateSetting('timeFormat', '12h')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  12-hour (AM/PM)
                  {settings.timeFormat === '12h' && <Check className="h-4 w-4 ml-2" />}
                </Button>
                <Button
                  variant={settings.timeFormat === '24h' ? 'default' : 'outline'}
                  className={`flex-1 ${settings.timeFormat === '24h' ? 'bg-neo-my-accent' : ''}`}
                  onClick={() => updateSetting('timeFormat', '24h')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  24-hour
                  {settings.timeFormat === '24h' && <Check className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="voice" className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <h3 className="text-sm font-medium">Voice Recording Duration</h3>
                <span className="text-sm text-gray-400">{settings.voiceInputDuration} seconds</span>
              </div>
              <Slider
                value={[settings.voiceInputDuration]}
                min={3}
                max={15}
                step={1}
                onValueChange={(value) => updateSetting('voiceInputDuration', value[0])}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Voice recording will automatically stop after this duration of silence
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-4 pt-4 border-t border-gray-700">
          <Button variant="ghost" onClick={resetSettings}>
            Reset to Defaults
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsPanel;
