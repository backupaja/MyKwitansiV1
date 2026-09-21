/**
 * Domain types aligned with the ERD (see src/imports/erd.png).
 *
 * All primary keys and foreign keys are int(11) in the ERD → typed as number.
 * Field names match the ERD exactly. UI display labels live in page components.
 *
 * ⚠ ERD NOTES:
 *
 * 1. formulir_transaksi has a duplicate "tanggal_transaksi timestamp" row in
 *    the ERD diagram. This appears to be a diagram artefact. Only one field is
 *    kept here; the database developer must confirm before schema creation.
 *
 * 2. formulir_nota PK is labelled "id_formulir_transaksi" in the ERD entity
 *    box, but data_nota references it as FK "id_formulir_nota". The FK name is
 *    authoritative (it disambiguates the two entities). The PK is normalised
 *    here to id_formulir_nota until the DB developer confirms the schema.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Core enum
// ─────────────────────────────────────────────────────────────────────────────

export type AdminJabatan = "bang_karir" | "bang_tensi";

// ─────────────────────────────────────────────────────────────────────────────
// ERD entities
// ─────────────────────────────────────────────────────────────────────────────

/** admin — ERD: id_admin int(11) PK */
export interface Admin {
  id_admin:  number;
  jabatan:   AdminJabatan;
  username:  string;
  /** Stored hashed; never returned to the client after login. */
  password?: string;
}

/**
 * formulir_transaksi — ERD: id_formulir_transaksi int(11) PK
 *
 * ⚠ The ERD lists "tanggal_transaksi timestamp" twice. Only one field is
 * modelled here. Confirm with the DB developer before schema migration.
 */
export interface FormulirTransaksi {
  id_formulir_transaksi: number;
  terima_dari:           string;   // varchar(20)
  jumlah_uang:           number;   // decimal(11,2)
  untuk_pembayaran:      string;   // varchar(20)
  penerima_uang:         string;   // varchar(20)
  tanggal_transaksi:     string;   // timestamp — ISO date string in the frontend
  tanggal_input:         string;   // timestamp (ERD typo: "tiemstamp") — set by server
  total_harga:           number;   // decimal(11,2)
  kota:                  string;   // varchar(20)
  id_admin:              number;   // FK → admin.id_admin
}

/** data_transaksi — ERD: id_data_transaksi int(11) PK */
export interface DataTransaksi {
  id_data_transaksi:     number;
  id_formulir_transaksi: number;  // FK → formulir_transaksi.id_formulir_transaksi
  id_admin:              number;  // FK → admin.id_admin
}

/** print_kwitansi — ERD: id_print_kwitansi int(11) PK */
export interface PrintKwitansi {
  id_print_kwitansi: number;
  id_admin:          number;  // FK → admin.id_admin
  id_data_transaksi: number;  // FK → data_transaksi.id_data_transaksi
}

/**
 * formulir_nota — ERD: PK labelled "id_formulir_transaksi" in the diagram but
 * referenced as "id_formulir_nota" in data_nota FK. Normalised to
 * id_formulir_nota here.
 */
export interface FormulirNota {
  id_formulir_nota:  number;   // PK int(11)  ⚠ see note above
  tanggal_transaksi: string;   // timestamp — ISO date string in the frontend
  nama_barang:       string;   // varchar(20)
  satuan:            string;   // varchar(10)
  harga:             number;   // decimal(11,2)
  jumlah_item:       number;   // int(11)
  sub_total_harga:   number;   // decimal(11,2)
  total_harga:       number;   // decimal(11,2)
  id_admin:          number;   // FK → admin.id_admin
}

/** data_nota — ERD: id_data_nota int(11) PK */
export interface DataNota {
  id_data_nota:    number;
  id_admin:        number;  // FK → admin.id_admin
  id_formulir_nota: number; // FK → formulir_nota.id_formulir_nota
}

/** print_nota — ERD: id_print_nota int(11) PK */
export interface PrintNota {
  id_print_nota: number;
  id_data_nota:  number;  // FK → data_nota.id_data_nota
  id_admin:      number;  // FK → admin.id_admin
}

// ─────────────────────────────────────────────────────────────────────────────
// View / joined types used by the UI
//
// These resolve foreign keys for display. They introduce no new domain
// concepts — every field maps back to an ERD entity or Admin.username.
// ─────────────────────────────────────────────────────────────────────────────

/** Row shape for Data Transaksi and Print Kwitansi tables. */
export interface DataTransaksiView {
  // data_transaksi fields
  id_data_transaksi:     number;
  id_formulir_transaksi: number;
  id_admin:              number;
  // resolved from formulir_transaksi
  tanggal_transaksi:     string;
  tanggal_input:         string;
  terima_dari:           string;
  jumlah_uang:           number;
  untuk_pembayaran:      string;
  penerima_uang:         string;
  kota:                  string;
  total_harga:           number;
  // resolved from admin
  admin_username:        string;
}

/** Row shape for Data Nota table. */
export interface DataNotaView {
  // data_nota fields
  id_data_nota:     number;
  id_formulir_nota: number;
  id_admin:         number;
  // resolved from formulir_nota
  tanggal_transaksi: string;
  nama_barang:       string;
  satuan:            string;
  harga:             number;
  jumlah_item:       number;
  sub_total_harga:   number;
  total_harga:       number;
  // resolved from admin
  admin_username:    string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Form input types — fields the user fills in when creating a new record.
// Server-generated fields (PKs, tanggal_input, computed totals) are excluded.
// ─────────────────────────────────────────────────────────────────────────────

export type CreateFormulirTransaksiInput = Omit<
  FormulirTransaksi,
  "id_formulir_transaksi" | "tanggal_input" | "id_admin"
>;

export type CreateFormulirNotaInput = Omit<
  FormulirNota,
  "id_formulir_nota" | "id_admin" | "sub_total_harga" | "total_harga"
>;
