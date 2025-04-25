
import React, { useState } from 'react';
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
import GeminiService from '@/services/GeminiService';

export interface TimeZoneInfo {
  id: string;
  name: string;
  time: Date;
  isSource?: boolean;
}

export interface TimeTilesProps {
  timeZones: TimeZoneInfo[];
  onTimeZoneChange: (oldZoneId: string, newZoneId: string) => void;
}

const TimeTile: React.FC<{ 
  timeZone: TimeZoneInfo;
  onTimeZoneChange?: (oldZoneId: string, newZoneId: string) => void;
}> = ({ timeZone, onTimeZoneChange }) => {
  const [customZone, setCustomZone] = useState('');
  const [searching, setSearching] = useState(false);
  const isSource = !!timeZone.isSource;

  const handleTimeZoneChange = (newZoneId: string) => {
    if (onTimeZoneChange) {
      onTimeZoneChange(timeZone.id, newZoneId);
    }
  };

  const handleCustomZoneSubmit = async () => {
    if (!customZone.trim()) return;
    
    setSearching(true);

    try {
      if (GeminiService.hasApiKey()) {
        // Use Gemini to process the city/location name
        const query = `Time in ${customZone}`;
        const result = await GeminiService.verifyTimeQuery(query);
        
        if (result.fromZone) {
          // AI identified a timezone
          handleTimeZoneChange(result.fromZone);
          setCustomZone('');
        } else {
          // Fallback to basic matching
          fallbackSearch();
        }
      } else {
        // No API key, use basic matching
        fallbackSearch();
      }
    } catch (error) {
      console.error('Error setting custom timezone:', error);
      fallbackSearch();
    } finally {
      setSearching(false);
    }
  };

  const fallbackSearch = () => {
    // Basic timezone search logic
    const searchTerm = customZone.toLowerCase();
    const matchingZone = timeZones.find(tz => 
      tz.name.toLowerCase().includes(searchTerm) ||
      tz.id.toLowerCase().includes(searchTerm) ||
      (tz.abbreviation && tz.abbreviation.toLowerCase() === searchTerm)
    );
    
    if (matchingZone) {
      handleTimeZoneChange(matchingZone.id);
      setCustomZone('');
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px] bg-neo-background border border-gray-700 max-h-[400px] overflow-y-auto">
                <div className="p-2 sticky top-0 bg-neo-background z-10 border-b border-gray-700">
                  <Input
                    placeholder="Search timezones..."
                    value={customZone}
                    onChange={(e) => setCustomZone(e.target.value)}
                    className="mb-2"
                  />
                  <Button 
                    onClick={handleCustomZoneSubmit}
                    className="w-full"
                    disabled={searching}
                  >
                    {searching ? 'Searching...' : 'Set Custom Timezone'}
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {timeZones.map((zone) => (
                  <DropdownMenuItem
                    key={zone.id}
                    onClick={() => handleTimeZoneChange(zone.id)}
                    className="text-white hover:bg-gray-700"
                  >
                    {zone.name} ({zone.id})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
