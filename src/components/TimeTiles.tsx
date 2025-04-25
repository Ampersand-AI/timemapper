import React, { useState } from 'react';
import { format } from 'date-fns';
import { formatToTimeZone } from '@/services/TimeUtils';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { timeZones } from '@/services/TimeUtils';
import OpenRouterService from '@/services/OpenRouterService';

export interface TimeZoneInfo {
  id: string;
  name: string;
  time: Date;
  isSource?: boolean;
}

const TimeTile: React.FC<{ 
  timeZone: TimeZoneInfo;
  onTimeZoneChange?: (oldZoneId: string, newZoneId: string) => void;
}> = ({ timeZone, onTimeZoneChange }) => {
  const [customZone, setCustomZone] = useState('');
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);
  const isSource = !!timeZone.isSource;

  const handleTimeZoneChange = (newZoneId: string) => {
    if (onTimeZoneChange) {
      onTimeZoneChange(timeZone.id, newZoneId);
    }
  };

  const handleCustomZoneSubmit = async () => {
    if (!customZone.trim()) return;

    try {
      if (OpenRouterService.hasApiKey()) {
        // Verify timezone with OpenRouter AI
        const result = await OpenRouterService.verifyTimeQuery(`time in ${customZone}`);
        if (result.fromZone) {
          handleTimeZoneChange(result.fromZone);
          setCustomZone('');
          setIsCustomInputOpen(false);
        } else {
          throw new Error('Invalid timezone');
        }
      }
    } catch (error) {
      console.error('Error setting custom timezone:', error);
      // Fallback to basic timezone search
      const matchingZone = timeZones.find(tz => 
        tz.name.toLowerCase().includes(customZone.toLowerCase()) ||
        tz.id.toLowerCase().includes(customZone.toLowerCase())
      );
      if (matchingZone) {
        handleTimeZoneChange(matchingZone.id);
        setCustomZone('');
        setIsCustomInputOpen(false);
      }
    }
  };
  
  return (
    <div className={`neo-raised p-6 ${isSource ? 'border-neo-my-accent/30' : 'border-neo-their-accent/30'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-medium ${isSource ? 'text-gradient-teal' : 'text-gradient-orange'}`}>
              {timeZone.name}
            </h3>
            {/* Only show settings icon on user's time card */}
            {isSource && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[300px] bg-neo-background border border-gray-700">
                  {timeZones.map((zone) => (
                    <DropdownMenuItem
                      key={zone.id}
                      onClick={() => handleTimeZoneChange(zone.id)}
                      className="text-white hover:bg-gray-700"
                    >
                      {zone.name} ({zone.id})
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Input
                      placeholder="Enter custom timezone or city..."
                      value={customZone}
                      onChange={(e) => setCustomZone(e.target.value)}
                      className="mb-2"
                    />
                    <Button 
                      onClick={handleCustomZoneSubmit}
                      className="w-full"
                    >
                      Set Custom Timezone
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">{timeZone.id}</p>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${isSource ? 'bg-neo-my-accent/20 text-neo-my-accent' : 'bg-neo-their-accent/20 text-neo-their-accent'}`}>
          {isSource ? 'Your Time' : 'Their Time'}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex flex-col items-center">
          <div className="flex items-baseline">
            <div className="text-7xl font-bold tracking-tight">
              {formatToTimeZone(timeZone.time, timeZone.id, 'h:mm')}
            </div>
            <div className="text-3xl ml-2 font-medium">
              {formatToTimeZone(timeZone.time, timeZone.id, 'a')}
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-xl text-white mt-2 font-medium">
              {formatToTimeZone(timeZone.time, timeZone.id, 'EEEE')}
            </div>
            <div className="text-lg text-gray-300">
              {formatToTimeZone(timeZone.time, timeZone.id, 'MMMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeTiles: React.FC<TimeTilesProps> = ({ timeZones, onTimeZoneChange }) => {
  if (!timeZones.length) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {timeZones.map(zone => (
        <TimeTile 
          key={zone.id} 
          timeZone={zone} 
          onTimeZoneChange={onTimeZoneChange}
        />
      ))}
    </div>
  );
};

export default TimeTiles;
