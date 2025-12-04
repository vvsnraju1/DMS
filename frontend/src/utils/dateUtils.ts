/**
 * Date utility functions for IST (Indian Standard Time) conversion
 * IST is UTC+5:30
 */

/**
 * Parse date string ensuring it's treated as UTC
 * Backend dates are stored in UTC but may not have 'Z' suffix
 */
const parseAsUTC = (dateString: string | Date): Date => {
  if (dateString instanceof Date) {
    return dateString;
  }
  
  // If the string doesn't have timezone info, assume it's UTC and add 'Z'
  let str = dateString;
  if (!str.endsWith('Z') && !str.includes('+') && !str.includes('-', 10)) {
    str = str + 'Z';
  }
  
  return new Date(str);
};

/**
 * Convert a UTC date to IST formatted string
 * Uses Intl.DateTimeFormat for accurate timezone conversion
 */
export const formatIST = (dateString: string | Date, formatOptions?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseAsUTC(dateString);
    
    // Default format options
    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      ...formatOptions
    };
    
    return new Intl.DateTimeFormat('en-IN', defaultOptions).format(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid date';
  }
};

/**
 * Format date with time in IST
 * Example: "02-Dec-2024 14:57"
 */
export const formatISTDateTime = (dateString: string | Date): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseAsUTC(dateString);
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    return new Intl.DateTimeFormat('en-IN', options).format(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid date';
  }
};

/**
 * Format date with time and seconds in IST
 * Example: "02-Dec-2024 14:57:30"
 */
export const formatISTFull = (dateString: string | Date): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseAsUTC(dateString);
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    
    return new Intl.DateTimeFormat('en-IN', options).format(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid date';
  }
};

/**
 * Format date only in IST (no time)
 * Example: "02-Dec-2024"
 */
export const formatISTDate = (dateString: string | Date): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseAsUTC(dateString);
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    };
    
    return new Intl.DateTimeFormat('en-IN', options).format(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Invalid date';
  }
};

/**
 * Get IST timezone label
 */
export const getISTLabel = (): string => 'IST';
