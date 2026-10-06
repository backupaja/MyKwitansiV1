import { useState, useEffect } from "react";
import { tokens } from "../styles/tokens";
import { Ico } from "../utils/icons";
import { formatAdminName, formatDocumentNumber } from "../utils/formatters";
import {
  PageHeader, Card, PrimaryBtn, OutlineBtn, Modal, FormField,
  CardToolbar, TableControls, DataTable, Td,
} from "../components/ui";
import { undanganService, pdfService } from "../services";
import { useAuth } from "../contexts/AuthContext";
import type { DataUndanganView, CreateFormulirUndanganInput } from "../types";

const { color } = tokens;

const HEADERS = [
  "No. Undangan",
  "Tgl Acara",
  "Tgl Input",
  "Admin",
  "Acara",
  "Tempat",
  "Aksi",
];

const EMPTY_FORM: CreateFormulirUndanganInput = {
  acara: "",
  penyelenggara: "",
  tanggal_acara: "",
  waktu: "",
  tempat: "",
  agenda: "",
  peserta: "",
  dokumen_pendukung: "",
  hasil_pertemuan: "",
  tembusan: "",
  tempat_tanggal_surat: "",
  nama_ttd: "",
  jabatan_ttd: "",
};

export default function UndanganPage() {
  const { currentAdmin } = useAuth();
  
  // Data state
  const [rows, setRows] = useState<DataUndanganView[]>([]);
  const [loading, setLoading] = useState(true);

  // Table controls
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateFormulirUndanganInput>(EMPTY_FORM);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DataUndanganView | null>(null);

  // View modal state
  const [viewTarget, setViewTarget] = useState<DataUndanganView | null>(null);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await undanganService.getAll();
      setRows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & pagination
  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return [r.acara, r.tempat, r.penyelenggara].some((v) => v?.toLowerCase().includes(q));
  });
  const totalPages = Math.ceil(filtered.length / pageSize);
  const currentData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handlePageSize = (v: number) => { setPageSize(v); setPage(1); };

  // Form handlers
  const openCreate = () => {
    setFormError("");
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (row: DataUndanganView) => {
    setFormError("");
    setEditingId(row.id_formulir_undangan);
    setFormData({
      acara: row.acara,
      penyelenggara: row.penyelenggara,
      tanggal_acara: row.tanggal_acara,
      waktu: row.waktu,
      tempat: row.tempat,
      agenda: row.agenda,
      peserta: row.peserta,
      dokumen_pendukung: row.dokumen_pendukung,
      hasil_pertemuan: row.hasil_pertemuan,
      tembusan: row.tembusan,
      tempat_tanggal_surat: row.tempat_tanggal_surat,
      nama_ttd: row.nama_ttd,
      jabatan_ttd: row.jabatan_ttd,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async () => {
    if (!formData.acara || !formData.tanggal_acara) {
      setFormError("Kolom Acara dan Tanggal Acara wajib diisi.");
      return;
    }
    try {
      if (editingId) {
        await undanganService.update(editingId, formData, currentAdmin?.id_admin || 1);
      } else {
        await undanganService.create(formData, currentAdmin?.id_admin || 1);
      }
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Gagal menyimpan data");
    }
  };

  // Delete handlers
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await undanganService.delete(deleteTarget.id_formulir_undangan);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data.");
    }
  };

  const openDelete = (row: DataUndanganView) => {
    setDeleteTarget(row);
    setIsDeleteOpen(true);
  };

  const handleDownloadPdf = async () => {
    if (!viewTarget) return;
    await pdfService.downloadUndanganPdf(viewTarget);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Data Undangan"
        subtitle="Kelola semua data surat undangan"
      />

      <Card>
        <CardToolbar>
          <PrimaryBtn onClick={openCreate}>
            + Tambah Undangan
          </PrimaryBtn>
          <TableControls
            search={search}
            onSearchChange={handleSearch}
            pageSize={pageSize}
            onPageSizeChange={handlePageSize}
          />
        </CardToolbar>

        <DataTable
          headers={HEADERS}
          loading={loading}
          isEmpty={filtered.length === 0}
          emptyMessage="Belum ada data undangan"
        >
          {currentData.map((row) => (
            <tr key={row.id_formulir_undangan} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
              <Td>{formatDocumentNumber(row.id_data_undangan)}</Td>
              <Td>{row.tanggal_acara}</Td>
              <Td>{row.tanggal_input.substring(0, 10)}</Td>
              <Td className={`font-semibold ${row.admin_username === "Bang Karir" ? "text-brand-600" : "text-brand-800"}`}>
                {formatAdminName(row.admin_username)}
              </Td>
              <Td>{row.acara}</Td>
              <Td>{row.tempat}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => setViewTarget(row)} className="p-1.5 text-gray-500 hover:text-brand-600 border border-gray-200 rounded hover:border-brand-600 transition-colors" title="Lihat">
                    {Ico.eye()}
                  </button>
                  <button onClick={() => openEdit(row)} className="p-1.5 text-gray-500 hover:text-brand-600 border border-gray-200 rounded hover:border-brand-600 transition-colors" title="Edit">
                    {Ico.edit()}
                  </button>
                  <button onClick={() => openDelete(row)} className="p-1.5 text-red-500 hover:text-red-700 border border-gray-200 rounded hover:border-red-500 transition-colors" title="Hapus">
                    {Ico.trash()}
                  </button>
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Menampilkan {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, filtered.length)} dari {filtered.length}</span>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 border border-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border border-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? "Edit Undangan" : "Tambah Undangan"}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Acara" error={formError && !formData.acara ? "Wajib diisi" : undefined}>
              <input type="text" className="input-field" value={formData.acara} onChange={(e) => setFormData({ ...formData, acara: e.target.value })} />
            </FormField>
            <FormField label="Penyelenggara">
              <input type="text" className="input-field" value={formData.penyelenggara} onChange={(e) => setFormData({ ...formData, penyelenggara: e.target.value })} />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Hari/Tanggal" error={formError && !formData.tanggal_acara ? "Wajib diisi" : undefined}>
              <input type="text" className="input-field" value={formData.tanggal_acara} onChange={(e) => setFormData({ ...formData, tanggal_acara: e.target.value })} placeholder="Contoh: Rabu, 30 September 2026" />
            </FormField>
            <FormField label="Waktu">
              <input type="text" className="input-field" value={formData.waktu} onChange={(e) => setFormData({ ...formData, waktu: e.target.value })} placeholder="Contoh: 08.30 - 16.00 WIB" />
            </FormField>
            <FormField label="Tempat">
              <input type="text" className="input-field" value={formData.tempat} onChange={(e) => setFormData({ ...formData, tempat: e.target.value })} />
            </FormField>
          </div>

          <FormField label="Agenda">
            <textarea className="input-field py-2" rows={2} value={formData.agenda} onChange={(e) => setFormData({ ...formData, agenda: e.target.value })} />
          </FormField>

          <FormField label="Peserta">
            <textarea className="input-field py-2" rows={2} value={formData.peserta} onChange={(e) => setFormData({ ...formData, peserta: e.target.value })} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Dokumen Pendukung">
              <input type="text" className="input-field" value={formData.dokumen_pendukung} onChange={(e) => setFormData({ ...formData, dokumen_pendukung: e.target.value })} />
            </FormField>
            <FormField label="Hasil Pertemuan">
              <input type="text" className="input-field" value={formData.hasil_pertemuan} onChange={(e) => setFormData({ ...formData, hasil_pertemuan: e.target.value })} />
            </FormField>
          </div>

          <FormField label="Tembusan">
            <input type="text" className="input-field" value={formData.tembusan} onChange={(e) => setFormData({ ...formData, tembusan: e.target.value })} />
          </FormField>

          <div className="border-t border-gray-100 pt-4 mt-4 grid grid-cols-3 gap-4">
            <FormField label="Tempat, Tgl Surat">
              <input type="text" className="input-field" value={formData.tempat_tanggal_surat} onChange={(e) => setFormData({ ...formData, tempat_tanggal_surat: e.target.value })} placeholder="Bandung, 30 Sep 2026" />
            </FormField>
            <FormField label="Nama TTD">
              <input type="text" className="input-field" value={formData.nama_ttd} onChange={(e) => setFormData({ ...formData, nama_ttd: e.target.value })} />
            </FormField>
            <FormField label="Jabatan TTD">
              <input type="text" className="input-field" value={formData.jabatan_ttd} onChange={(e) => setFormData({ ...formData, jabatan_ttd: e.target.value })} />
            </FormField>
          </div>

          {formError && (
            <div className="text-red-500 text-sm font-medium">{formError}</div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <OutlineBtn onClick={() => setIsFormOpen(false)}>Batal</OutlineBtn>
            <PrimaryBtn onClick={handleFormSubmit}>
              {editingId ? "Simpan Perubahan" : "Simpan Data"}
            </PrimaryBtn>
          </div>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Hapus Undangan"
      >
        <div className="py-4">
          <p className="text-gray-600 mb-6">
            Apakah Anda yakin ingin menghapus data undangan ini?
          </p>
          <div className="flex justify-end gap-3">
            <OutlineBtn onClick={() => setIsDeleteOpen(false)}>Batal</OutlineBtn>
            <button
              onClick={confirmDelete}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </Modal>

      {/* VIEW / PREVIEW MODAL */}
      <Modal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title="Preview Undangan"
        maxWidth="max-w-2xl"
      >
        {viewTarget && (
          <div>
            <div className="p-8 border border-gray-200 mt-4 bg-white min-h-[400px]">
              <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-4">
                <div className="text-xl font-bold tracking-widest text-brand-700">TELKOM UNIVERSITY</div>
                <div className="text-xl font-bold tracking-[0.3em]">U N D A N G A N</div>
              </div>
              <table className="w-full text-sm border-collapse border border-black mb-8">
                <tbody>
                  <tr>
                    <td className="border border-black p-2 font-bold w-1/3">Acara:</td>
                    <td className="border border-black p-2">{viewTarget.acara}</td>
                    <td className="border border-black p-2 font-bold w-1/4">Penyelenggara:</td>
                    <td className="border border-black p-2">{viewTarget.penyelenggara}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 font-bold">Hari/Tanggal:</td>
                    <td className="border border-black p-2">{viewTarget.tanggal_acara}</td>
                    <td className="border border-black p-2 font-bold">Waktu:</td>
                    <td className="border border-black p-2">{viewTarget.waktu}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 font-bold">Tempat:</td>
                    <td className="border border-black p-2" colSpan={3}>{viewTarget.tempat}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 font-bold">Agenda:</td>
                    <td className="border border-black p-2" colSpan={3}>{viewTarget.agenda}</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2 font-bold">Peserta:</td>
                    <td className="border border-black p-2" colSpan={3}>{viewTarget.peserta}</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-between mt-12">
                <div className="text-sm">
                  <div className="font-bold">Tembusan:</div>
                  <div>{viewTarget.tembusan}</div>
                </div>
                <div className="text-sm text-center">
                  <div>{viewTarget.tempat_tanggal_surat}</div>
                  <div className="mt-16 font-bold underline">{viewTarget.nama_ttd}</div>
                  <div className="font-bold">{viewTarget.jabatan_ttd}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <OutlineBtn onClick={() => setViewTarget(null)}>Tutup</OutlineBtn>
              <OutlineBtn onClick={handleDownloadPdf}>
                {Ico.download()} Download PDF
              </OutlineBtn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
