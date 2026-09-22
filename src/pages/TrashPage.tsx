import { useState, useEffect } from "react";
import { PageHeader, Card, CardToolbar, PrimaryBtn } from "../components/ui";
import { Ico } from "../utils/icons";
import { DataTable, Td } from "../components/ui/DataTable";
import { transactionService, notaService } from "../services";
import { useAuth } from "../contexts/AuthContext";
import type { DataTransaksiView, DataNotaView } from "../types";
import { formatDocumentNumber, formatRp, formatDateInput, formatAdminName } from "../utils/formatters";

export function TrashPage({ onToast }: { onToast: (message: string) => void }) {
  const { currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"transaksi" | "nota">("transaksi");

  const [transaksiRows, setTransaksiRows] = useState<DataTransaksiView[]>([]);
  const [notaRows, setNotaRows] = useState<DataNotaView[]>([]);
  
  const [loading, setLoading] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === "transaksi") {
        const rows = await transactionService.getDeleted();
        setTransaksiRows(rows);
      } else {
        const rows = await notaService.getDeleted();
        setNotaRows(rows);
      }
    } catch (e: any) {
      onToast(e.message || "Gagal memuat riwayat hapus.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function handleRestoreTransaksi(id: number) {
    if (!confirm("Kembalikan transaksi ini ke data aktif?")) return;
    try {
      await transactionService.restore(id);
      onToast("Transaksi berhasil dikembalikan.");
      loadData();
    } catch (e: any) {
      onToast(e.message || "Gagal mengembalikan transaksi.");
    }
  }

  async function handleHardDeleteTransaksi(id: number) {
    if (!confirm("Hapus PERMANEN transaksi ini? Data tidak bisa dikembalikan!")) return;
    try {
      await transactionService.hardDelete(id);
      onToast("Transaksi dihapus permanen.");
      loadData();
    } catch (e: any) {
      onToast(e.message || "Gagal menghapus permanen.");
    }
  }

  async function handleRestoreNota(id: number) {
    if (!confirm("Kembalikan nota ini ke data aktif?")) return;
    try {
      await notaService.restore(id);
      onToast("Nota berhasil dikembalikan.");
      loadData();
    } catch (e: any) {
      onToast(e.message || "Gagal mengembalikan nota.");
    }
  }

  async function handleHardDeleteNota(id: number) {
    if (!confirm("Hapus PERMANEN nota ini? Data tidak bisa dikembalikan!")) return;
    try {
      await notaService.hardDelete(id);
      onToast("Nota dihapus permanen.");
      loadData();
    } catch (e: any) {
      onToast(e.message || "Gagal menghapus permanen.");
    }
  }

  return (
    <div>
      <PageHeader title="Riwayat Hapus" subtitle="Kelola data terhapus (Trash) yang akan dihapus permanen setelah 30 hari" />
      
      <div className="flex gap-4 mb-4">
        <button 
          className={`px-4 py-2 font-semibold rounded-md border ${activeTab === "transaksi" ? "bg-red-900 text-white border-red-900" : "bg-white text-gray-700 border-gray-300"}`}
          onClick={() => setActiveTab("transaksi")}
        >
          Kwitansi (Transaksi)
        </button>
        <button 
          className={`px-4 py-2 font-semibold rounded-md border ${activeTab === "nota" ? "bg-red-900 text-white border-red-900" : "bg-white text-gray-700 border-gray-300"}`}
          onClick={() => setActiveTab("nota")}
        >
          Nota
        </button>
      </div>

      <Card className="p-5">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Memuat data...</div>
        ) : activeTab === "transaksi" ? (
          <DataTable
            headers={["No", "Tgl Transaksi", "Diterima Dari", "Admin", "Terhapus Pada", "Aksi"]}
            shownEntries={transaksiRows.length}
            totalEntries={transaksiRows.length}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
          >
            {transaksiRows.map((r) => (
              <tr key={r.id_data_transaksi} className="tr-hover">
                <Td>{formatDocumentNumber(r.id_data_transaksi)}</Td>
                <Td>{r.tanggal_transaksi}</Td>
                <Td>{r.terima_dari}</Td>
                <Td accent>{formatAdminName(r.admin_username)}</Td>
                <Td>{formatDateInput(r.deleted_at || "")}</Td>
                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                  <div className="flex items-center gap-1.5 justify-center">
                    <button
                      onClick={() => handleRestoreTransaksi(r.id_formulir_transaksi)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold
                        border transition-colors duration-100"
                      style={{ color: "#059669", borderColor: "#34d399", background: "#ecfdf5" }}
                    >
                      {Ico.sync()} Restore
                    </button>
                    <button
                      onClick={() => handleHardDeleteTransaksi(r.id_formulir_transaksi)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold
                        border transition-colors duration-100"
                      style={{ color: "#b91c1c", borderColor: "#fca5a5", background: "#fef2f2" }}
                    >
                      {Ico.trash()} Hapus Permanen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {transaksiRows.length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-gray-500">Tidak ada riwayat hapus kwitansi.</td></tr>
            )}
          </DataTable>
        ) : (
          <DataTable
            headers={["No Nota", "Tgl Transaksi", "Admin", "Total", "Terhapus Pada", "Aksi"]}
            shownEntries={notaRows.length}
            totalEntries={notaRows.length}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
          >
            {notaRows.map((n) => (
              <tr key={n.id_data_nota} className="tr-hover">
                <Td>{formatDocumentNumber(n.id_data_nota)}</Td>
                <Td>{n.tanggal_transaksi}</Td>
                <Td accent>{formatAdminName(n.admin_username)}</Td>
                <Td mono>{formatRp(n.total_harga)}</Td>
                <Td>{formatDateInput(n.deleted_at || "")}</Td>
                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                  <div className="flex items-center gap-1.5 justify-center">
                    <button
                      onClick={() => handleRestoreNota(n.id_formulir_nota)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold
                        border transition-colors duration-100"
                      style={{ color: "#059669", borderColor: "#34d399", background: "#ecfdf5" }}
                    >
                      {Ico.sync()} Restore
                    </button>
                    <button
                      onClick={() => handleHardDeleteNota(n.id_formulir_nota)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold
                        border transition-colors duration-100"
                      style={{ color: "#b91c1c", borderColor: "#fca5a5", background: "#fef2f2" }}
                    >
                      {Ico.trash()} Hapus Permanen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {notaRows.length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-gray-500">Tidak ada riwayat hapus nota.</td></tr>
            )}
          </DataTable>
        )}
      </Card>
    </div>
  );
}
