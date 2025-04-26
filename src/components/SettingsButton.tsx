
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SettingsPanel from '@/components/SettingsPanel';

const SettingsButton = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full neo-raised h-10 w-10"
        onClick={() => setIsSettingsOpen(true)}
      >
        <Settings className="h-5 w-5" />
      </Button>
      
      <SettingsPanel
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </>
  );
};

export default SettingsButton;
