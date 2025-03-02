
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, Monitor, Moon, Volume2 } from 'lucide-react';
import { KeyboardShortcut } from '../voiceApplication/types';

interface AccessibilityControlsProps {
  isScreenReaderMode: boolean;
  highContrast: boolean;
  toggleScreenReaderMode: () => void;
  toggleHighContrast: () => void;
  keyboardShortcuts: KeyboardShortcut[];
  lastAnnouncement?: string;
}

export const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({
  isScreenReaderMode,
  highContrast,
  toggleScreenReaderMode,
  toggleHighContrast,
  keyboardShortcuts,
  lastAnnouncement
}) => {
  return (
    <div className="accessibility-controls border border-muted rounded-md p-4" role="region" aria-label="Accessibility Controls">
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Volume2 size={16} className="text-primary" />
        Accessibility Options
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center justify-between">
          <label htmlFor="screen-reader-mode" className="text-sm flex items-center gap-2">
            {isScreenReaderMode ? <Eye size={16} /> : <EyeOff size={16} />}
            Screen Reader Mode
          </label>
          <Switch 
            id="screen-reader-mode"
            checked={isScreenReaderMode}
            onCheckedChange={toggleScreenReaderMode}
            aria-label="Toggle screen reader mode"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label htmlFor="high-contrast" className="text-sm flex items-center gap-2">
            {highContrast ? <Moon size={16} /> : <Monitor size={16} />}
            High Contrast
          </label>
          <Switch 
            id="high-contrast"
            checked={highContrast}
            onCheckedChange={toggleHighContrast}
            aria-label="Toggle high contrast mode"
          />
        </div>
      </div>
      
      {isScreenReaderMode && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-2">Keyboard Shortcuts:</p>
          <ul className="text-xs space-y-1">
            {keyboardShortcuts.map((shortcut, index) => (
              <li key={index} className="flex justify-between">
                <span>{shortcut.description}</span>
                <kbd className="px-1 bg-muted rounded">{shortcut.key}</kbd>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isScreenReaderMode && lastAnnouncement && (
        <div 
          className="sr-only" 
          role="status" 
          aria-live="polite"
          aria-atomic="true"
        >
          {lastAnnouncement}
        </div>
      )}
    </div>
  );
};
