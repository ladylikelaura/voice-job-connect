
/**
 * Utility functions for voice application events
 */

/**
 * Dispatches a custom event for controlling page behavior
 */
export const dispatchVoiceApplicationEvent = (eventName: string): void => {
  window.dispatchEvent(new CustomEvent(eventName));
};
