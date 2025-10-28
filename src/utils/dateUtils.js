// Utility functions for consistent date formatting throughout the application

/**
 * Formats a date to dd/mm/yyyy format
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string in dd/mm/yyyy format
 */
export const formatDateDDMMYYYY = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date and time to dd/mm/yyyy HH:mm format
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date and time string in dd/mm/yyyy HH:mm format
 */
export const formatDateTimeDDMMYYYY = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Converts a date to YYYY-MM-DD format for HTML date inputs
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toISOString().split('T')[0];
};

/**
 * Gets current date in YYYY-MM-DD format for HTML date inputs
 * @returns {string} - Current date in YYYY-MM-DD format
 */
export const getCurrentDateForInput = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Gets current date and time in ISO format for datetime-local inputs
 * @returns {string} - Current date and time in YYYY-MM-DDTHH:mm format
 */
export const getCurrentDateTimeForInput = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};
