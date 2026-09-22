/** Format a number as Indonesian Rupiah: "Rp 1.234.567" */
export function formatRp(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}

/** Convert a number to its Indonesian written form ("terbilang"). */
export function terbilang(n: number): string {
  const sat = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima",
    "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas",
  ];
  if (n < 12)   return sat[n];
  if (n < 20)   return sat[n - 10] + " Belas";
  if (n < 100)  return sat[Math.floor(n / 10)] + " Puluh"  + (n % 10  ? " " + sat[n % 10]           : "");
  if (n < 200)  return "Seratus"                           + (n % 100 ? " " + terbilang(n % 100)     : "");
  if (n < 1000) return sat[Math.floor(n / 100)] + " Ratus" + (n % 100 ? " " + terbilang(n % 100)     : "");
  if (n < 2000) return "Seribu"                            + (n % 1000? " " + terbilang(n % 1000)    : "");
  if (n < 1e6)  return terbilang(Math.floor(n / 1000))  + " Ribu"   + (n % 1000 ? " " + terbilang(n % 1000) : "");
  if (n < 1e9)  return terbilang(Math.floor(n / 1e6))   + " Juta"   + (n % 1e6  ? " " + terbilang(n % 1e6)  : "");
  return           terbilang(Math.floor(n / 1e9))   + " Miliar" + (n % 1e9  ? " " + terbilang(n % 1e9)  : "");
}

/** Today's date formatted in Indonesian long form. */
export const TODAY_LABEL = new Date().toLocaleDateString("id-ID", {
  weekday: "long",
  year:    "numeric",
  month:   "long",
  day:     "numeric",
});

/** Current four-digit year, used in kwitansi print preview. */
export const CURRENT_YEAR = new Date().getFullYear();

/** Format admin username to display name (e.g., "bang_karir" -> "Bang Karir") */
export function formatAdminName(username: string | undefined): string {
  if (!username) return "-";
  return username
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/** Format document/nota ID to exactly 4 digits (e.g., 12 -> 0012) */
export function formatDocumentNumber(id: number | string | undefined): string {
  if (id === undefined || id === null) return "0000";
  const numStr = String(id).padStart(4, "0");
  return numStr;
}

/** 
 * Format a string input into a Rupiah string safely without altering the underlying numeric state.
 * Primarily used for controlled inputs.
 */
export function formatCurrencyInput(value: string): string {
  // Strip non-numeric
  const numericValue = value.replace(/\D/g, "");
  if (!numericValue) return "";
  // Format with thousand separators
  return "Rp " + parseInt(numericValue, 10).toLocaleString("id-ID");
}

/** Parses a formatted currency input string back to an integer. */
export function parseCurrencyInput(value: string): number {
  const numericValue = value.replace(/\D/g, "");
  if (!numericValue) return 0;
  return parseInt(numericValue, 10);
}

/** Formats a date string (ISO or otherwise) into DD-MMM-YYYY */
export function formatDateInput(dateString: string | undefined): string {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; // fallback if invalid
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).replace(/ /g, "-");
  } catch {
    return dateString;
  }
}
