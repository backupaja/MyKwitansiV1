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
