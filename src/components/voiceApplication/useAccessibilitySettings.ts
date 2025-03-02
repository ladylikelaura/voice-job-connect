
import { useState, useEffect, useCallback } from 'react';
import { KeyboardShortcut } from './types';

export const useAccessibilitySettings = () => {
  const [isScreenReaderMode, setIsScreenReaderMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState<string>('');
  
  const keyboardShortcuts: KeyboardShortcut[] = [
    { key: 'Alt+S', description: 'Start/Stop interview' },
    { key: 'Alt+M', description: 'Toggle mute' },
    { key: 'Alt+R', description: 'Reset application' },
    { key: 'Alt+D', description: 'Download CV' },
    { key: 'Alt+A', description: 'Announce current status' },
  ];
  
  const announce = useCallback((message: string) => {
    if (isScreenReaderMode) {
      setLastAnnouncement(message);
      
      // Reset the announcement after screen readers have time to read it
      setTimeout(() => {
        setLastAnnouncement('');
      }, 3000);
    }
  }, [isScreenReaderMode]);
  
  const toggleScreenReaderMode = useCallback(() => {
    const newMode = !isScreenReaderMode;
    setIsScreenReaderMode(newMode);
    
    if (newMode) {
      announce('Screen reader mode enabled. Keyboard shortcuts are now available.');
    } else {
      announce('Screen reader mode disabled.');
    }
    
    // Save preference
    localStorage.setItem('screenReaderMode', String(newMode));
  }, [isScreenReaderMode, announce]);
  
  const toggleHighContrast = useCallback(() => {
    const newMode = !highContrast;
    setHighContrast(newMode);
    
    // Save preference
    localStorage.setItem('highContrast', String(newMode));
    
    if (isScreenReaderMode) {
      announce(newMode ? 'High contrast mode enabled.' : 'High contrast mode disabled.');
    }
  }, [highContrast, isScreenReaderMode, announce]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isScreenReaderMode) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt+S: Start/Stop interview
      if (event.altKey && event.key === 's') {
        const startButton = document.querySelector('[aria-label*="interview"]') as HTMLButtonElement;
        if (startButton) {
          startButton.click();
          announce('Interview toggled.');
        }
      }
      
      // Alt+M: Toggle mute
      if (event.altKey && event.key === 'm') {
        const muteButton = document.querySelector('[aria-label*="mute"]') as HTMLButtonElement;
        if (muteButton) {
          muteButton.click();
          announce('Microphone toggled.');
        }
      }
      
      // Alt+R: Reset application
      if (event.altKey && event.key === 'r') {
        const resetButton = document.querySelector('[aria-label*="reset"]') as HTMLButtonElement;
        if (resetButton) {
          resetButton.click();
          announce('Application reset.');
        }
      }
      
      // Alt+D: Download CV
      if (event.altKey && event.key === 'd') {
        const downloadButton = document.querySelector('[aria-label*="download"]') as HTMLButtonElement;
        if (downloadButton) {
          downloadButton.click();
          announce('CV download started.');
        }
      }
      
      // Alt+A: Announce current status
      if (event.altKey && event.key === 'a') {
        const statusElement = document.querySelector('[aria-label*="status"]');
        if (statusElement) {
          announce(`Current status: ${statusElement.textContent}`);
        } else {
          announce('Ready to start interview. Press Alt+S to begin.');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isScreenReaderMode, announce]);
  
  // Load saved preferences
  useEffect(() => {
    const savedScreenReaderMode = localStorage.getItem('screenReaderMode');
    const savedHighContrast = localStorage.getItem('highContrast');
    
    if (savedScreenReaderMode === 'true') {
      setIsScreenReaderMode(true);
    }
    
    if (savedHighContrast === 'true') {
      setHighContrast(true);
    }
    
    // Check if user has any accessibility preferences set in the browser
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && !savedScreenReaderMode) {
      setIsScreenReaderMode(true);
      localStorage.setItem('screenReaderMode', 'true');
    }
    
    // Check for high contrast preference
    const prefersContrast = window.matchMedia('(prefers-contrast: more)').matches;
    if (prefersContrast && !savedHighContrast) {
      setHighContrast(true);
      localStorage.setItem('highContrast', 'true');
    }
  }, []);
  
  return {
    isScreenReaderMode,
    highContrast,
    toggleScreenReaderMode,
    toggleHighContrast,
    keyboardShortcuts,
    lastAnnouncement,
    announce
  };
};
