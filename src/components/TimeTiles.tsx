
import React from 'react';
import { format } from 'date-fns';
import { formatToTimeZone } from '@/services/TimeUtils';

export interface TimeZoneInfo {
  id: string;
  name: string;
  time: Date;
  isSource?: boolean;
}

interface TimeTilesProps {
  timeZones: TimeZoneInfo[];
}

const TimeTile: React.FC<{ timeZone: TimeZoneInfo }> = ({ timeZone }) => {
  const isSource = !!timeZone.isSource;
  
  return (
    <div className={`neo-raised p-4 ${isSource ? 'border-neo-my-accent/30' : 'border-neo-their-accent/30'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-medium ${isSource ? 'text-gradient-teal' : 'text-gradient-orange'}`}>
            {timeZone.name}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{timeZone.id}</p>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${isSource ? 'bg-neo-my-accent/20 text-neo-my-accent' : 'bg-neo-their-accent/20 text-neo-their-accent'}`}>
          {isSource ? 'Your Time' : 'Their Time'}
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="flex justify-center items-center">
          <div className="text-5xl font-bold">
            {formatToTimeZone(timeZone.time, timeZone.id, 'h:mm')}
          </div>
          <div className="text-2xl ml-2 mt-1 font-medium">
            {formatToTimeZone(timeZone.time, timeZone.id, 'a')}
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1">{format(timeZone.time, 'EEEE, MMMM d, yyyy')}</div>
      </div>
    </div>
  );
};

const TimeTiles: React.FC<TimeTilesProps> = ({ timeZones }) => {
  if (!timeZones.length) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {timeZones.map(zone => (
        <TimeTile key={zone.id} timeZone={zone} />
      ))}
    </div>
  );
};

export default TimeTiles;
