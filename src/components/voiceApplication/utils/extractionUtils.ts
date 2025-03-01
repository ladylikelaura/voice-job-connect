
/**
 * Utility functions for extracting information from interview transcripts
 */

/**
 * Tries to extract text using multiple regex patterns
 * @param text The text to search in
 * @param patterns Array of regex patterns to try
 * @returns The first successful match or null
 */
export const extractWithPatterns = (
  text: string,
  patterns: RegExp[]
): string | null => {
  for (const pattern of patterns) {
    try {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    } catch (error) {
      console.error(`Error using regex pattern ${pattern}:`, error);
    }
  }
  return null;
};

/**
 * Safely creates a RegExp by handling potential errors
 * @param pattern The regex pattern to use
 * @param flags Optional regex flags
 * @returns A RegExp object or null if creation failed
 */
export const safeRegExp = (
  pattern: string,
  flags?: string
): RegExp | null => {
  try {
    return new RegExp(pattern, flags);
  } catch (error) {
    console.error(`Error creating RegExp with pattern ${pattern}:`, error);
    return null;
  }
};

/**
 * Fallback string matching when regex fails
 * @param text The text to search in
 * @param searchString The string to search for
 * @param caseSensitive Whether to match case-sensitively
 * @returns True if found, false otherwise
 */
export const stringIncludes = (
  text: string,
  searchString: string,
  caseSensitive = false
): boolean => {
  if (!caseSensitive) {
    return text.toLowerCase().includes(searchString.toLowerCase());
  }
  return text.includes(searchString);
};

/**
 * Extract context around a matched pattern
 * @param text Full text to extract from
 * @param match The regex match result
 * @param contextSize Number of characters to include before/after the match
 * @returns The extracted context or null
 */
export const extractContext = (
  text: string, 
  match: RegExpMatchArray, 
  contextSize = 50
): string | null => {
  if (!match || match.index === undefined) return null;
  
  const start = Math.max(0, match.index - contextSize);
  const end = Math.min(text.length, match.index + match.length + contextSize);
  
  return text.substring(start, end).trim();
};
