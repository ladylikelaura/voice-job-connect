
import { renderHook, act } from '@testing-library/react';
import { useVoiceConversation } from '../useVoiceConversation';

// Mock the ElevenLabs Conversation API
jest.mock('@11labs/client', () => ({
  Conversation: {
    startSession: jest.fn().mockImplementation(({ onConnect, onMessage }) => {
      // Simulate connection and messages
      setTimeout(() => onConnect(), 100);
      setTimeout(() => onMessage({ 
        source: 'ai', 
        message: 'Hello, tell me about your experience' 
      }), 200);
      
      // Return mock conversation object
      return {
        endSession: jest.fn().mockResolvedValue(undefined),
        setVolume: jest.fn()
      };
    })
  }
}));

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue({}),
  },
  writable: true,
});

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn()
  }
}));

describe('useVoiceConversation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useVoiceConversation());
    
    expect(result.current.isCallActive).toBe(false);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.generatedCV).toBeNull();
    expect(result.current.callDuration).toBe(0);
    expect(result.current.isMuted).toBe(false);
    expect(result.current.interviewTranscript).toEqual([]);
  });

  it('toggles mute state correctly', () => {
    const { result } = renderHook(() => useVoiceConversation());
    
    // Initialize conversation first
    act(() => {
      result.current.startConversation();
      jest.advanceTimersByTime(200); // Wait for connection
    });
    
    // Toggle mute
    act(() => {
      result.current.toggleMute();
    });
    
    expect(result.current.isMuted).toBe(true);
    
    // Toggle again
    act(() => {
      result.current.toggleMute();
    });
    
    expect(result.current.isMuted).toBe(false);
  });

  it('starts and ends conversation correctly', async () => {
    const { result } = renderHook(() => useVoiceConversation());
    
    // Start conversation
    act(() => {
      result.current.startConversation();
    });
    
    // Processing should be true initially
    expect(result.current.isProcessing).toBe(true);
    
    // Advance timers to simulate connection
    act(() => {
      jest.advanceTimersByTime(150);
    });
    
    // After connection, processing should be false and call active
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.isCallActive).toBe(true);
    
    // End conversation
    act(() => {
      result.current.endConversation();
    });
    
    // Call should no longer be active
    expect(result.current.isCallActive).toBe(false);
  });

  it('resets application state correctly', () => {
    const { result } = renderHook(() => useVoiceConversation());
    
    // Setup some state first
    act(() => {
      // Manually set some state for testing
      result.current.startConversation();
      jest.advanceTimersByTime(200);
    });
    
    // Manually set generated CV for testing
    act(() => {
      // Simulate setting CV
      Object.defineProperty(result.current, 'generatedCV', {
        value: 'Test CV content'
      });
      
      // Reset application
      result.current.resetApplication();
    });
    
    // State should be reset
    expect(result.current.generatedCV).toBeNull();
    expect(result.current.callDuration).toBe(0);
    expect(result.current.interviewTranscript).toEqual([]);
  });
});
