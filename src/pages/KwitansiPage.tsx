import { useState, useEffect } from "react";
import { tokens } from "../styles/tokens";
import { Ico } from "../utils/icons";
import { formatRp, terbilang, CURRENT_YEAR } from "../utils/formatters";
import {
  PageHeader, Card, PrimaryBtn, Modal,
  CardToolbar, TableControls, DataTable, Td,
} from "../components/ui";
import { transactionService, printService } from "../services";
import type { DataTransaksiView } from "../types";

const { color } = tokens;

const HEADERS = [
  "No. Transaksi",
  "Tgl Transaksi",
  "Tgl Input",
  "Admin",
  "Terima Dari",
  "Jumlah Uang",
  "Untuk Pembayaran",
];

interface KwitansiPageProps {
  adminId: number;
}

export function KwitansiPage({ adminId }: KwitansiPageProps) {
  const [rows,     setRows]     = useState<DataTransaksiView[]>([]);
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<DataTransaksiView | null>(null);

  useEffect(() => {
    transactionService.getAll().then(setRows);
  }, []);

  const filtered = rows.filter((t) =>
    [t.admin_username, t.terima_dari].some((v) =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );

  async function handlePrint() {
    if (!selected) return;
    await printService.printKwitansi(selected, adminId);
  }

  return (
    <div>
      <PageHeader title="Print Kwitansi" subtitle="Pilih transaksi untuk mencetak kwitansi" />

      <Card className="p-5">
        <CardToolbar
          left={
            <PrimaryBtn onClick={handlePrint} disabled={!selected}>
              {Ico.print()} Print Kwitansi
            </PrimaryBtn>
          }
          right={<TableControls search={search} onSearch={setSearch} />}
        />

        <DataTable headers={HEADERS} shownEntries={filtered.length} totalEntries={202}>
          {filtered.map((t) => (
            <tr
              key={t.id_data_transaksi}
              className="tr-hover cursor-pointer"
              onClick={() => setSelected(t)}
            >
              <td className="px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={selected?.id_data_transaksi === t.id_data_transaksi}
                  onChange={() => setSelected(t)}
                />
              </td>
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

      {selected && (
        <Modal title="Kwitansi Pembayaran" onClose={() => setSelected(null)} wide>
          <div className="space-y-4">
            {[
              { label: "No Kwitansi",      value: String(selected.id_data_transaksi).padStart(4, "0") },
              { label: "Diterima Dari",    value: selected.terima_dari },
              { label: "Terbilang",        value: terbilang(selected.jumlah_uang) + " Rupiah" },
              { label: "Untuk Pembayaran", value: selected.untuk_pembayaran },
            ].map((row) => (
              <div key={row.label} className="flex gap-4">
                <span
                  className="text-sm text-gray-500 text-right flex-shrink-0"
                  style={{ width: 150 }}
                >
                  {row.label}
                </span>
                <span className="flex-1 text-sm text-gray-800 font-medium border-b border-dashed border-gray-200 pb-1">
                  {row.value}
                </span>
              </div>
            ))}

            <div className="flex items-end justify-between pt-4 border-t border-gray-100 mt-2">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Jumlah</p>
                <p className="text-base font-bold" style={{ color: color.brand }}>
                  {formatRp(selected.jumlah_uang)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  {selected.kota}, {selected.tanggal_transaksi}-{CURRENT_YEAR}
                </p>
                <div className="w-32 border-b border-gray-300 mt-10 mb-1" />
                <p className="text-xs text-gray-400">Penerima</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
