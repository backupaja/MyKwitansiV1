import { useState, useEffect } from "react";
import { Ico } from "../utils/icons";
import { formatRp } from "../utils/formatters";
import {
  PageHeader, Card, PrimaryBtn, Modal, FormField,
  CardToolbar, TableControls, DataTable, Td,
} from "../components/ui";
import { transactionService } from "../services";
import type { DataTransaksiView, CreateFormulirTransaksiInput } from "../types";

// Displayed column headers (ERD field names mapped to human-readable labels)
const HEADERS = [
  "No. Transaksi",   // id_data_transaksi
  "Tgl Transaksi",   // tanggal_transaksi
  "Tgl Input",       // tanggal_input
  "Admin",           // admin_username
  "Terima Dari",     // terima_dari
  "Jumlah Uang",     // jumlah_uang
  "Untuk Pembayaran",// untuk_pembayaran
];

const EMPTY_FORM: CreateFormulirTransaksiInput = {
  tanggal_transaksi: "",
  terima_dari:       "",
  jumlah_uang:       0,
  untuk_pembayaran:  "",
  penerima_uang:     "",
  kota:              "Jakarta",
  total_harga:       0,
};

interface TransaksiPageProps {
  adminId: number;
  adminName: string;
  onToast: (message: string) => void;
}

export function TransaksiPage({ adminId, adminName: _adminName, onToast }: TransaksiPageProps) {
  const [rows,     setRows]     = useState<DataTransaksiView[]>([]);
  const [search,   setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState<CreateFormulirTransaksiInput>(EMPTY_FORM);

  // Load data on mount
  useEffect(() => {
    transactionService.getAll().then(setRows);
  }, []);

  // Client-side search (replace with service.search() for server-side)
  const filtered = rows.filter((t) =>
    [t.admin_username, t.terima_dari, t.untuk_pembayaran].some((v) =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );

  function setField<K extends keyof CreateFormulirTransaksiInput>(
    key: K, value: CreateFormulirTransaksiInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    await transactionService.create(form, adminId);
    const updated = await transactionService.getAll();
    setRows(updated);
    setShowForm(false);
    setForm(EMPTY_FORM);
    onToast("Data transaksi berhasil ditambahkan");
  }

  return (
    <div>
      <PageHeader title="Data Transaksi" subtitle="Kelola semua data transaksi pembayaran" />

      <Card className="p-5">
        <CardToolbar
          left={
            <PrimaryBtn onClick={() => setShowForm(true)}>
              {Ico.plus()} Tambah Transaksi
            </PrimaryBtn>
          }
          right={<TableControls search={search} onSearch={setSearch} />}
        />

        <DataTable headers={HEADERS} shownEntries={filtered.length} totalEntries={202}>
          {filtered.map((t) => (
            <tr key={t.id_data_transaksi} className="tr-hover">
              <td className="px-4 py-3.5"><input type="checkbox" /></td>
              <Td>{t.id_data_transaksi}</Td>
              <Td>{t.tanggal_transaksi}</Td>
              <Td>{t.tanggal_input}</Td>
              <Td accent>{t.admin_username}</Td>
              <Td>{t.terima_dari}</Td>
              <Td mono>{formatRp(t.jumlah_uang)}</Td>
              <Td>{t.untuk_pembayaran}</Td>
            </tr>
          ))}
        </DataTable>
      </Card>

      {showForm && (
        <Modal title="Tambah Transaksi" onClose={() => setShowForm(false)}>
          <FormField label="Tanggal Transaksi" type="date"   value={form.tanggal_transaksi}  onChange={(v) => setField("tanggal_transaksi", v)} />
          <FormField label="Terima Dari"       type="text"   value={form.terima_dari}         onChange={(v) => setField("terima_dari", v)} />
          <FormField label="Jumlah Uang"       type="number" value={String(form.jumlah_uang)} onChange={(v) => setField("jumlah_uang", Number(v))} />
          <FormField label="Untuk Pembayaran"  type="text"   value={form.untuk_pembayaran}    onChange={(v) => setField("untuk_pembayaran", v)} />
          <FormField label="Penerima Uang"     type="text"   value={form.penerima_uang}        onChange={(v) => setField("penerima_uang", v)} />
          <FormField label="Kota"              type="text"   value={form.kota}                onChange={(v) => setField("kota", v)} />
          <PrimaryBtn onClick={handleSubmit} className="w-full justify-center mt-4">
            Simpan
          </PrimaryBtn>
        </Modal>
      )}
    </div>
  );
}
