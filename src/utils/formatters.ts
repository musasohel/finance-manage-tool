export const formatCurrency = (amount: number, symbol: string = 'BDT'): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }
  const formattedNumber = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);

  // If symbol is length > 1 (e.g. BDT, USD), append it like "20,000 BDT".
  // If it's a prefix character like "$", "€", "£", "₹", put it in front like "$20,000".
  if (['$', '€', '£', '₹', '¥'].includes(symbol)) {
    return `${symbol}${formattedNumber}`;
  }
  return `${formattedNumber} ${symbol}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

export const formatInvoiceNumber = (prefix?: string, numOrStr?: number | string): string => {
  const cleanPrefix = (prefix && prefix.trim() ? prefix.trim() : 'INV').toUpperCase();
  
  let numStr = '0001';
  if (typeof numOrStr === 'number') {
    numStr = String(numOrStr).padStart(4, '0');
  } else if (typeof numOrStr === 'string' && numOrStr.trim()) {
    const match = numOrStr.match(/\d+/);
    if (match) {
      numStr = match[0].padStart(4, '0');
    } else {
      numStr = numOrStr.trim();
    }
  }

  if (/[-/_.:]$/.test(cleanPrefix)) {
    return `${cleanPrefix}${numStr}`;
  }
  return `${cleanPrefix}-${numStr}`;
};

export const validateEmail = (email: string): boolean => {
  if (!email) return true; // optional in some forms
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return false; // required
  // Allow numbers, spaces, plus, hyphens, parentheses
  const re = /^[+\d\s\-()]{7,20}$/;
  return re.test(phone.trim());
};
