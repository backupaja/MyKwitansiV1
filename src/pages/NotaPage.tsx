import { useState, useEffect } from "react";
import { Ico } from "../utils/icons";
import { formatRp } from "../utils/formatters";
import {
  PageHeader, Card, PrimaryBtn, OutlineBtn, Modal, FormField,
  CardToolbar, TableControls, DataTable, Td,
} from "../components/ui";
import { notaService } from "../services";
import type { DataNotaView, CreateFormulirNotaInput } from "../types";

// Displayed column headers (mapped from ERD field names)
const HEADERS = [
  "No. Nota",        // id_data_nota
  "Tgl Transaksi",   // tanggal_transaksi
  "Tgl Input",       // tanggal_input (optional)
  "Admin",           // admin_username
  "Nama Barang",     // nama_barang
  "Jumlah Item",     // jumlah_item
  "Harga",           // harga
];

const EMPTY_FORM: CreateFormulirNotaInput = {
  tanggal_transaksi: "",
  nama_barang:       "",
  satuan:            "",
  harga:             0,
  jumlah_item:       0,
};

interface NotaPageProps {
  adminId: number;
  onToast: (message: string) => void;
}

export function NotaPage({ adminId, onToast }: NotaPageProps) {
  const [rows,     setRows]     = useState<DataNotaView[]>([]);
  const [search,   setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState<CreateFormulirNotaInput>(EMPTY_FORM);

  useEffect(() => {
    notaService.getAll().then(setRows);
  }, []);

  const filtered = rows.filter((n) =>
    [n.admin_username, n.nama_barang].some((v) =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );

  function setField<K extends keyof CreateFormulirNotaInput>(
    key: K, value: CreateFormulirNotaInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    await notaService.create(form, adminId);
    const updated = await notaService.getAll();
    setRows(updated);
    setShowForm(false);
    setForm(EMPTY_FORM);
    onToast("Data nota berhasil ditambahkan");
  }

  return (
    <div>
      <PageHeader title="Data Nota" subtitle="Kelola data nota pembelian barang" />

      <Card className="p-5">
        <CardToolbar
          left={
            <>
              {/* Primary action */}
              <PrimaryBtn onClick={() => setShowForm(true)}>
                {Ico.plus()} Buat Nota
              </PrimaryBtn>
              {/* Secondary action */}
              <OutlineBtn>{Ico.print()} Print Nota</OutlineBtn>
            </>
          }
          right={<TableControls search={search} onSearch={setSearch} />}
        />

        <DataTable headers={HEADERS} shownEntries={filtered.length} totalEntries={202}>
          {filtered.map((n) => (
            <tr key={n.id_data_nota} className="tr-hover">
              <td className="px-4 py-3.5"><input type="checkbox" /></td>
              <Td>{n.id_data_nota}</Td>
              <Td>{n.tanggal_transaksi}</Td>
              <Td>{n.tanggal_input ?? "—"}</Td>
              <Td accent>{n.admin_username}</Td>
              <Td>{n.nama_barang}</Td>
              <Td mono>{n.jumlah_item}</Td>
              <Td mono>{formatRp(n.harga)}</Td>
            </tr>
          ))}
        </DataTable>
      </Card>

      {showForm && (
        <Modal title="Buat Nota" onClose={() => setShowForm(false)}>
          <FormField label="Tanggal Transaksi" type="date"   value={form.tanggal_transaksi}  onChange={(v) => setField("tanggal_transaksi", v)} />
          <FormField label="Nama Barang"        type="text"   value={form.nama_barang}         onChange={(v) => setField("nama_barang", v)} />
          <FormField label="Satuan"             type="text"   value={form.satuan}              onChange={(v) => setField("satuan", v)} />
          <FormField label="Jumlah Item"        type="number" value={String(form.jumlah_item)} onChange={(v) => setField("jumlah_item", Number(v))} />
          <FormField label="Harga"              type="number" value={String(form.harga)}       onChange={(v) => setField("harga", Number(v))} />
          <PrimaryBtn onClick={handleSubmit} className="w-full justify-center mt-4">
            Simpan
          </PrimaryBtn>
        </Modal>
      )}
    </div>
  );
}
