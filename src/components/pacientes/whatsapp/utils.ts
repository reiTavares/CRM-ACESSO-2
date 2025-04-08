import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

// Format Phone Number to JID (for sending)
export const formatPhoneNumberToJid = (phone: string | undefined): string | null => {
  if (!phone) return null;
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10 || cleaned.length > 13) return null; // Basic validation
  // Ensure 55 prefix for Brazilian numbers
  if ((cleaned.length === 10 || cleaned.length === 11) && !cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
  }
  // If it has 12 or 13 digits and starts with 55, assume it's correct
  if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
     return `${cleaned}@s.whatsapp.net`;
  }
  // Add other country code logic if needed
  return null; // Return null if format is unexpected
};

// Format JID for History Fetch (Remove 9th digit for BR numbers)
export const formatJidForHistory = (jid: string | null): string | null => {
  if (!jid) return null;
  const match = jid.match(/^55(\d{2})(9?)(\d{8})@s\.whatsapp\.net$/);
  if (match) {
      // It's a Brazilian number (55 + 2 area code + optional 9 + 8 digits)
      const areaCode = match[1];
      const mainNumber = match[3];
      return `55${areaCode}${mainNumber}@s.whatsapp.net`;
  }
  // Not a Brazilian mobile number in the expected format, return original
  return jid;
};

// Safely format dates
export const safeFormatDate = (dateInput: Date | string | number | null | undefined, formatString: string): string => {
  if (!dateInput) return "";
  try {
    const date = typeof dateInput === 'number'
      ? new Date(dateInput * 1000) // Assume Unix timestamp in seconds
      : typeof dateInput === 'string'
      ? parseISO(dateInput)
      : dateInput;

    if (date instanceof Date && !isNaN(date.getTime())) {
      return format(date, formatString, { locale: ptBR });
    }
  } catch (error) {
    console.error("Error formatting date:", dateInput, error);
  }
  return "Data inválida";
};

// Helper to capitalize strings
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
