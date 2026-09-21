/**
 * Static mock data for stub services.
 *
 * All IDs are integers (int(11) per ERD). Composite string keys ("ft-1") have
 * been removed. Replace this module with real service implementations
 * (Supabase or Tauri + SQLite) before production.
 */
import type { DataTransaksiView, DataNotaView } from "../types";

export const MOCK_TRANSAKSI: DataTransaksiView[] = [
  {
    id_data_transaksi: 1, id_formulir_transaksi: 1, id_admin: 1,
    tanggal_transaksi: "16-Jan-2025", tanggal_input: "19-Jan-2025",
    terima_dari: "Universitas Telkom", jumlah_uang: 5750000,
    untuk_pembayaran: "Extra Fooding", penerima_uang: "Bang Karir",
    kota: "Jakarta", total_harga: 5750000, admin_username: "Bang Karir",
  },
  {
    id_data_transaksi: 2, id_formulir_transaksi: 2, id_admin: 1,
    tanggal_transaksi: "05-Jan-2025", tanggal_input: "07-Jan-2025",
    terima_dari: "Universitas Telkom", jumlah_uang: 978750000,
    untuk_pembayaran: "Extra Fooding", penerima_uang: "Bang Karir",
    kota: "Jakarta", total_harga: 978750000, admin_username: "Bang Karir",
  },
  {
    id_data_transaksi: 3, id_formulir_transaksi: 3, id_admin: 2,
    tanggal_transaksi: "05-Jan-2025", tanggal_input: "07-Jan-2025",
    terima_dari: "Universitas Telkom", jumlah_uang: 90000000,
    untuk_pembayaran: "Extra Fooding", penerima_uang: "Bang Tensi",
    kota: "Jakarta", total_harga: 90000000, admin_username: "Bang Tensi",
  },
  {
    id_data_transaksi: 4, id_formulir_transaksi: 4, id_admin: 1,
    tanggal_transaksi: "05-Jan-2025", tanggal_input: "07-Jan-2025",
    terima_dari: "Universitas Telkom", jumlah_uang: 809200000,
    untuk_pembayaran: "Extra Fooding", penerima_uang: "Bang Karir",
    kota: "Jakarta", total_harga: 809200000, admin_username: "Bang Karir",
  },
  {
    id_data_transaksi: 5, id_formulir_transaksi: 5, id_admin: 1,
    tanggal_transaksi: "05-Jan-2025", tanggal_input: "07-Jan-2025",
    terima_dari: "Universitas Telkom", jumlah_uang: 23000000,
    untuk_pembayaran: "Extra Fooding", penerima_uang: "Bang Karir",
    kota: "Jakarta", total_harga: 23000000, admin_username: "Bang Karir",
  },
  {
    id_data_transaksi: 6, id_formulir_transaksi: 6, id_admin: 2,
    tanggal_transaksi: "15-Des-2024", tanggal_input: "20-Des-2024",
    terima_dari: "Universitas Telkom", jumlah_uang: 978750000,
    untuk_pembayaran: "Extra Fooding", penerima_uang: "Bang Tensi",
    kota: "Jakarta", total_harga: 978750000, admin_username: "Bang Tensi",
  },
  {
    id_data_transaksi: 7, id_formulir_transaksi: 7, id_admin: 2,
    tanggal_transaksi: "15-Des-2024", tanggal_input: "20-Des-2024",
    terima_dari: "Universitas Telkom", jumlah_uang: 90000000,
    untuk_pembayaran: "Extra Fooding", penerima_uang: "Bang Tensi",
    kota: "Jakarta", total_harga: 90000000, admin_username: "Bang Tensi",
  },
];

export const MOCK_NOTA: DataNotaView[] = [
  {
    id_data_nota: 1, id_formulir_nota: 1, id_admin: 2,
    tanggal_transaksi: "05-Jan-2025", nama_barang: "Tinta Printer",
    satuan: "pcs", harga: 105000, jumlah_item: 4,
    sub_total_harga: 420000, total_harga: 420000, admin_username: "Bang Tensi",
  },
  {
    id_data_nota: 2, id_formulir_nota: 2, id_admin: 2,
    tanggal_transaksi: "05-Jan-2025", nama_barang: "HVS",
    satuan: "rim", harga: 85000, jumlah_item: 3,
    sub_total_harga: 255000, total_harga: 255000, admin_username: "Bang Tensi",
  },
  {
    id_data_nota: 3, id_formulir_nota: 3, id_admin: 2,
    tanggal_transaksi: "05-Jan-2025", nama_barang: "Tel-U Fresh",
    satuan: "pcs", harga: 25000, jumlah_item: 2,
    sub_total_harga: 50000, total_harga: 50000, admin_username: "Bang Tensi",
  },
  {
    id_data_nota: 4, id_formulir_nota: 4, id_admin: 1,
    tanggal_transaksi: "05-Jan-2025", nama_barang: "Beng-Beng",
    satuan: "pcs", harga: 3500, jumlah_item: 35,
    sub_total_harga: 122500, total_harga: 122500, admin_username: "Bang Karir",
  },
  {
    id_data_nota: 5, id_formulir_nota: 5, id_admin: 1,
    tanggal_transaksi: "05-Jan-2025", nama_barang: "Kopi Mandja",
    satuan: "pcs", harga: 35000, jumlah_item: 12,
    sub_total_harga: 420000, total_harga: 420000, admin_username: "Bang Karir",
  },
  {
    id_data_nota: 6, id_formulir_nota: 6, id_admin: 2,
    tanggal_transaksi: "15-Des-2024", nama_barang: "Roti Bakar Boss",
    satuan: "pcs", harga: 28000, jumlah_item: 12,
    sub_total_harga: 336000, total_harga: 336000, admin_username: "Bang Tensi",
  },
  {
    id_data_nota: 7, id_formulir_nota: 7, id_admin: 2,
    tanggal_transaksi: "15-Des-2024", nama_barang: "Tel-U Fresh",
    satuan: "pcs", harga: 25000, jumlah_item: 2,
    sub_total_harga: 50000, total_harga: 50000, admin_username: "Bang Tensi",
  },
];
